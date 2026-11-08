import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, #478bff 0%, #0e46f5 48%, #0a35c7 100%)",
          borderRadius: 40,
          position: "relative",
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 18,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: 9999,
            background: "#5ce1ff",
            border: "5px solid #ffffff",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}

