import whatsapp from '~/assets/whatsapp.svg';
import {Image} from '@shopify/hydrogen';

export function Whatsapp() {
  return (
    <div className="fixed bottom-5 left-5 z-50 group">
      <a
        href="https://wa.me/972549215445"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3"
      >
        {/* Bubble */}
        <div
          className="
            overflow-hidden
            max-w-0
            opacity-0
            group-hover:max-w-xs
            group-hover:opacity-100
            transition-all
            duration-300
          "
        >
          <p
            className="
              whitespace-nowrap
              border
              px-4
              py-2
              rounded-2xl
              text-white
              bg-[var(--color-primary)]
              shadow-lg
            "
          >
            צרו איתי קשר!
          </p>
        </div>

        {/* WhatsApp icon */}
        <div className="relative hover:scale-110 transition-transform duration-300">
          <Image src={whatsapp} alt="WhatsApp" width={50} height={50} />

          <div className="bg-red-500 w-2 h-2 rounded-full absolute top-0 right-0 animate-ping" />
        </div>
      </a>
    </div>
  );
}