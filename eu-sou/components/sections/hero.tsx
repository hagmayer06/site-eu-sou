import Image from "next/image";

export default function Hero(){
    return (
        <section className="relative h-screen">

            {/* camada 1 — imagem de fundo */}
            <Image 
                src="/img/img-fundo.jpg"  
                alt="Fundo Hero"  
                fill                        
                className="object-cover z-0" 
                loading="eager"
            />

            {/* camada 2 — vinheta */}
            <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.95)_100%)]" />

            {/* camada 3 — logo + texto juntos */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-2">
                <div className="relative w-[320px] h-[240px] sm:w-[480px] sm:h-[360px] md:w-[600px] md:h-[450px] lg:w-[750px] lg:h-[560px] xl:w-[900px] xl:h-[675px]">
                    <Image 
                        src="/img/logo.png"  
                        alt="Logo Eu Sou"  
                        fill
                        className="object-contain" 
                        loading="eager"
                    />
                </div>
                <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl tracking-widest text-center px-4">
                    Resgatando a identidade em Cristo e formando Discipulos
                </h3>
            </div>

        </section>
    )
}