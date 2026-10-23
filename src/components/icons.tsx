import type { SVGProps } from "react";

/*
 * Brand icons drawn in the same outline style as lucide-react (24x24, 2px
 * stroke, round caps). lucide dropped brand logos, so these live here.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Outline({ size = 24, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M3.5 20.5 4.8 16.6A8.5 8.5 0 1 1 8 19.6Z" />
      <path d="M9 8.6c.2-.4.6-.6 1-.5l.6.1.8 1.8-.7.9a5 5 0 0 0 2.4 2.4l.9-.7 1.8.8.1.6c.1.4-.1.8-.5 1-2.9 1.3-7.7-3.5-6.4-6.4Z" />
    </Outline>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M21.5 4.5 2.8 11.7c-.9.4-.9 1.6.1 1.9l4.6 1.4 1.8 5.5c.2.7 1.1.9 1.6.4l2.6-2.5 4.7 3.5c.6.4 1.4.1 1.6-.6l3-14.6c.2-.9-.7-1.6-1.3-1.2Z" />
      <path d="m7.5 15 10-7.5-6.6 9.4" />
    </Outline>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Outline>
  );
}

export function LinkedInIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v5" />
      <path d="M8 8h.01" />
      <path d="M12 16v-5" />
      <path d="M16 16v-3a2 2 0 0 0-4 0" />
    </Outline>
  );
}
