// app/api/records/route.ts
import { NextRequest, NextResponse } from "next/server"

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET

if (!PINATA_API_KEY || !PINATA_API_SECRET) {
  console.warn("⚠️ PINATA_API_KEY or PINATA_API_SECRET not set in env.")
}

// Helper to call Pinata
async function pinToIPFS(payload: any) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY as string,
      pinata_secret_api_key: PINATA_API_SECRET as string,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}))
    console.error("Pinata pinJSONToIPFS failed:", errJson)
    throw new Error("Pinata upload failed")
  }

  return res.json() as Promise<{ IpfsHash: string }>
}

// POST /api/records
// Called by Doctor Dashboard: save a NEW encrypted record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      patientIdentityKey,
      doctorIdentityKey,
      recordType,
      createdAt,
      ciphertext,
    } = body

    if (!ciphertext || !Array.isArray(ciphertext)) {
      return NextResponse.json(
        { error: "Missing or invalid ciphertext." },
        { status: 400 },
      )
    }

    if (!patientIdentityKey || !doctorIdentityKey) {
      return NextResponse.json(
        { error: "Missing patientIdentityKey or doctorIdentityKey." },
        { status: 400 },
      )
    }

    // 1️⃣ Pin encrypted record + metadata to IPFS via Pinata
    const pinataJson = await pinToIPFS({
      pinataMetadata: {
        name: "medichain-record",
        keyvalues: {
          patientIdentityKey,
          doctorIdentityKey,
          recordType: recordType || "unknown",
        },
      },
      pinataContent: {
        ciphertext,
        patientIdentityKey,
        doctorIdentityKey,
        recordType,
        createdAt,
      },
    })

    const cid = pinataJson.IpfsHash

    // 2️⃣ Return CID as both id + cid (so frontend shape stays the same)
    return NextResponse.json({ id: cid, cid })
  } catch (e) {
    console.error("POST /api/records error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// GET /api/records?patientIdentityKey=...
// Called by Patient Dashboard: list ALL records for a wallet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patientIdentityKey = searchParams.get("patientIdentityKey")

    if (!patientIdentityKey) {
      return NextResponse.json(
        { error: "patientIdentityKey is required" },
        { status: 400 },
      )
    }

    // 1️⃣ List all pinned "medichain-record" JSONs from Pinata
    const listRes = await fetch(
      `https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=medichain-record&pageLimit=100`,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY as string,
          pinata_secret_api_key: PINATA_API_SECRET as string,
        },
      },
    )

    if (!listRes.ok) {
      const errJson = await listRes.json().catch(() => ({}))
      console.error("Pinata pinList failed:", errJson)
      return NextResponse.json(
        { error: "Failed to list records from Pinata." },
        { status: 500 },
      )
    }

    const listJson = await listRes.json()
    const rows: any[] = listJson.rows || []

    const records: any[] = []

    // 2️⃣ For each pin, fetch the JSON content and filter by patientIdentityKey
    for (const row of rows) {
      const cid = row.ipfs_pin_hash
      try {
        const gwRes = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
        if (!gwRes.ok) continue

        const content = await gwRes.json().catch(() => null)
        if (!content) continue

        if (content.patientIdentityKey !== patientIdentityKey) continue

        records.push({
          id: cid,
          cid,
          patientIdentityKey: content.patientIdentityKey,
          doctorIdentityKey: content.doctorIdentityKey,
          recordType: content.recordType,
          createdAt: content.createdAt,
        })
      } catch (err) {
        console.warn("Skip pin due to error:", cid, err)
      }
    }

    // 3️⃣ Sort newest first (optional)
    records.sort((a, b) => {
      const ta = new Date(a.createdAt ?? 0).getTime()
      const tb = new Date(b.createdAt ?? 0).getTime()
      return tb - ta
    })

    return NextResponse.json({ records })
  } catch (e) {
    console.error("GET /api/records error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
