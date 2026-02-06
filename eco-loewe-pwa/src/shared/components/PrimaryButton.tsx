import type { ButtonHTMLAttributes } from "react";

export default function PrimaryButton({
  small,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { small?: boolean }) {
  return (
    <button
      {...props}
      className={[
        "btn",
        "btnPrimary",
        small ? "btnSmall" : "",
        className ?? ""
      ].join(" ")}
    />
  );
}
