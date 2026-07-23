import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";

const BACKEND_URL =
  "https://nemesis-bundle-mobility.ngrok-free.dev/api";

export async function action({ request }: ActionFunctionArgs) {
  try {
    if (request.method !== "POST") {
      return Response.json(
        {
          success: false,
          message: "Method Not Allowed",
        },
        {
          status: 405,
        },
      );
    }

    const { token } = await request.json();

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "JWT token is required",
        },
        {
          status: 400,
        },
      );
    }

    const session = await prisma.session.findFirst({
      where: {
        isOnline: false,
      },
    });

    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Shopify session not found",
        },
        {
          status: 404,
        },
      );
    }

    const response = await fetch(`${BACKEND_URL}/shopify/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        shop_domain: session.shop,
        shop_name: session.shop,
        access_token: session.accessToken,
        scopes: session.scope ?? "",
      }),
    });

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
    });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      },
    );
  }
}