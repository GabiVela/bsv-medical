// app/api/records/route.ts
import { NextRequest, NextResponse } from "next/server"

const records: any[] = []  // In-memory store for demo

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

    if (!ciphertext) {
      return NextResponse.json({ error: "Missing ciphertext." }, { status: 400 })
    }

    // --- Pinata upload ---
    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: process.env.PINATA_API_KEY!,   // safe
          pinata_secret_api_key: process.env.PINATA_API_SECRET!,
        },
        body: JSON.stringify({
          pinataMetadata: {
            name: "medichain-record",
          },
          pinataContent: {
            ciphertext,
          },
        }),
      }
    )

    const pinataJson = await pinataRes.json()
    if (!pinataJson.IpfsHash) {
      return NextResponse.json(
        { error: "Pinata upload failed", details: pinataJson },
        { status: 500 }
      )
    }

    const cid = pinataJson.IpfsHash

    // --- Save metadata ---
    const id = `${Date.now()}-${Math.random()}`
    records.push({
      id,
      cid,
      patientIdentityKey,
      doctorIdentityKey,
      recordType,
      createdAt,
    })

    return NextResponse.json({ id, cid })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const patientIdentityKey = searchParams.get("patientIdentityKey")

  if (!patientIdentityKey) {
    return NextResponse.json(
      { error: "patientIdentityKey is required" },
      { status: 400 }
    )
  }

  const patientRecords = records.filter(
    (r) => r.patientIdentityKey === patientIdentityKey
  )

  return NextResponse.json({ records: patientRecords })
}
