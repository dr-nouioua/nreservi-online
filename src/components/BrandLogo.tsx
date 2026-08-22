// Brand lockup that adapts to the color theme:
// light variant on light surfaces, white-text variant on dark surfaces.
export function BrandLogo({
  mark = false,
  className = "",
}: {
  mark?: boolean;
  className?: string;
}) {
  const light = mark ? "/brand/nreservi-mark.png" : "/brand/nreservi-logo.png";
  const dark = mark ? "/brand/nreservi-mark-dark.png" : "/brand/nreservi-logo-dark.png";
  return (
    <>
      <img src={light} alt="nreservi.online" width={mark ? 172 : 815} height={125} className={`${className} dark:hidden`} />
      <img src={dark} alt="" aria-hidden="true" width={mark ? 170 : 677} height={125} className={`hidden ${className} dark:block`} />
    </>
  );
}
