export function Logo({ className = '' }: { className?: string }) {
 return <span className={`logo ${className}`}>
  <img className="logo-on-dark" src="/assets/logo-white.svg" alt="GYM82"/>
  <img className="logo-on-light" src="/assets/logo-black.svg" alt="" aria-hidden="true"/>
 </span>;
}
