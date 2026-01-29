import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export async function GET(request) {
  console.log({ request });
  const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const APP_CERT = process.env.NEXT_PUBLIC_AGORA_PRIMARY_CERTIFICATE;

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") || "demo-room";
  const uid = Math.floor(Math.random() * 100000);

  const role = RtcRole.PUBLISHER;
  const expireTime = 3600; // 1 hour
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERT,
    channel,
    uid,
    role,
    privilegeExpireTime
  );

  return Response.json({
    token,
    uid,
  });
}
