export default function MusicArtwork() {
  return <div className="relative mx-auto w-full max-w-[320px] text-[#79bff5] sm:max-w-[360px]" aria-hidden="true">
    <svg className="block w-full origin-center motion-safe:animate-[mare-record-turn_40s_linear_infinite]" viewBox="0 0 480 480" fill="none">
      <circle cx="240" cy="240" r="213" stroke="currentColor" strokeOpacity=".3" />
      {[194, 181, 168, 155, 142, 129, 116, 103].map(radius => <circle key={radius} cx="240" cy="240" r={radius} stroke="currentColor" strokeOpacity=".16" />)}
      <circle cx="240" cy="240" r="78" fill="currentColor" />
      <circle cx="240" cy="240" r="9" fill="var(--mare-record-ink, #080a10)" />
      <path d="M87 88a216 216 0 0 1 305 0M87 392a216 216 0 0 1 0-304" stroke="currentColor" strokeWidth="2" />
      <path d="M214 206v-16m13 22v-29m13 29v-38m13 38v-29m13 23v-16" stroke="var(--mare-record-ink, #080a10)" strokeWidth="4" strokeLinecap="round" />
    </svg>
    <span className="mt-5 block text-center text-sm text-slate-400">maré / música em comum</span>
  </div>
}
