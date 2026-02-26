import {TiltFloat} from './useTilt';
import {Image} from '@shopify/hydrogen';
import bgMockup from '~/assets/background-mockup.png';

export function HeroSlide({homepage}: {homepage: any}) {
  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 items-center justify-items-center min-h-[80vh] px-8 relative z-0"
      style={{background: homepage.background}}
    >
      {/* IMAGE */}
      <TiltFloat>
        <Image
          src={homepage.image}
          alt={homepage.title}
          className="object-contain"
          width={500}
          height={500}
        />
      </TiltFloat>

      <Image src={bgMockup} alt="Background Mockup" className="absolute z-[-1] top-0 right-0 h-full  object-cover" 
        width={600}
        height={600}
      />    

      {/* TEXT */}
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-6xl font-bold">
          {homepage.title}
        </h1>
        <div className="w-10 border-b-1 border-[#eb702580]" />

        <button className="bg-black text-[12px] text-white px-6 py-3 rounded-md hover:opacity-80 transition cursor-pointer">
          {homepage.button}
        </button>
      </div>
    </section>
  );
}