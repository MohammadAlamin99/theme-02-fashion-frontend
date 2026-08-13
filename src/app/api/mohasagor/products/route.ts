import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";

  try {
    const res = await fetch(
      `https://mohasagor.com.bd/api/reseller/product?page=${page}`,
      {
        method: "GET",
        headers: {
          "api-key": "xrGuaYn8ZPZZ8oMZ",
          "secret-key":
            "11ae6a994890d3d27d0e605130f383128fcfae4f991fe2ef0f7dd747d901dc02",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `Mohasagor API responded with status ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
