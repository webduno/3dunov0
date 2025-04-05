import Image from 'next/image'
import styles from './page.module.css'
import { FaTwitter, FaTelegram, FaYoutube, FaTiktok, FaExchangeAlt, FaChartLine, FaFilePdf, FaFile, FaGamepad, FaWhatsapp, FaInstagram, FaGlasses, FaSun, FaMoon, FaUser, FaHome } from 'react-icons/fa'
import { GiGecko } from 'react-icons/gi'
import { FaCartShopping, FaEarDeaf, FaEarListen, FaHandBackFist } from 'react-icons/fa6'
import { TbShoe } from 'react-icons/tb'

export const ContactButton = () => {
  return (<>
    <a className='pos-fix right-0 bottom-0 pa-4 opaci-chov--50 z-100 hover-4' target='_blank' href='https://api.whatsapp.com/message/QVPL7P6JGWOVI1' >
      <div className='bord-r-100p flex-col h-50px w-50px' style={{background: "linear-gradient(45deg, #0EBA2A, #62F87D)"}}>
        <FaWhatsapp className='pos-abs tx-lg' style={{color: "white"}} />
      </div>
    </a>
  </>)
}

export const AppButtonsGroup = () => {
  return (<>
    <div className=' w-100 bg-white flex tx-altfont-1'>
      <a href='/' className='nodeco opaci-chov--75 tx-black flex-1 flex-col' style={{boxShadow: "inset 0 0 2px #dddddd"}}>
        <div className='py-3 flex-col'>
          <div className='opaci-50 '>
          <FaHome />
          </div>
          <div>Home</div>
          </div>
      </a>
      <a href='/shop' className='nodeco opaci-chov--75 tx-black flex-1 flex-col' style={{boxShadow: "inset 0 0 2px #dddddd"}}>
        <div className='py-3 flex-col'>
          <div className='opaci-50 '>
          <FaUser />
          </div>
          <div>User</div>
          </div>
      </a>
      <a href='/shop#checkout' className='nodeco opaci-chov--75 tx-black flex-1 flex-col' style={{boxShadow: "inset 0 0 2px #dddddd"}}>
        <div className='py-3 flex-col'>
          <div className='opaci-50 '>
          <FaCartShopping />
          </div>
          <div>Cart</div>
          </div>
      </a>
      <div className='flex-1 flex-col'>

      <a className=' pa-4 opaci-chov--50 z-100 ' target='_blank' href='https://api.whatsapp.com/message/QVPL7P6JGWOVI1' >
      <div className='bord-r-100p flex-col h-50px w-50px' style={{background: "linear-gradient(45deg, #0EBA2A, #62F87D)"}}>
        <FaWhatsapp className='pos-abs tx-lg' style={{color: "white"}} />
      </div>
    </a>
      </div>
    </div>
  </>)
}


export const LogoButton = () => {
  return (<>
    <a className='pos-fix left-0 top-0 pa-4 opaci-chov--50 z-100 ' href='/'>
      <div className='bord-r-100p flex-col h-50px w-50px' style={{background: "linear-gradient(45deg, #0EBA2A, #62F87D)"}}>
        {/* <FaWhatsapp className='pos-abs tx-lg' style={{color: "white"}} /> */}
        <img src='./favicon/android-icon-72x72.png' width={64} className='pos-abs' />
      </div>
    </a>
  </>)
}

  
export const HeroSection = () => {
    return (<>
      <div className='w-100  w-max-1080px'>
        <div className='flex-wrap flex-align-start'>
          
        <div className='flex-col Q_xs mb-8'>
              <img src='/img/phones.png' className='w-100 w-max-700px '  />
              <div className='w-100 flex '>
                <div className='flex-1'></div>
                <a className=' w-min-250px tx-center nodeco tx-black  box-shadow-2-b mainActionButton' href='/shop'
                  style={{
                    // borderRadius: "25px 10px 10px 25px",
                    // boxShadow: "-2px 2px 0 #FFD23F"
                  }}
                >
                  <div className='tx-xl py-2 tx-altfont-1 '>Enter</div>
                </a>
              </div>
            </div>

          <div className='flex-1 flex-col flex-justify-start'>
            <div className='mt-100 Q_sm_x'>
            </div>
            <div>
              <img src='/img/maingrid.png' className=' w-100 w-max-600px' />
            </div>
          </div>
          <div className='flex flex-align-start'>
            
            <div className='flex-col Q_sm_x'>
              <img src='/img/phones.png' className='w-100 w-max-700px '  />
              <div className='w-100 flex '>
                <div className='flex-1'></div>
                <a className=' w-min-250px tx-center nodeco  box-shadow-2-b mainActionButton tx-black nodeco' href='/shop'
                  style={{
                    // borderRadius: "25px 10px 10px 25px",
                    // boxShadow: "-2px 2px 0 #FFD23F"
                  }}
                >
                  <div className='tx-xl py-2 tx-altfont-1 '>Enter</div>
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </>)
  }
  export const MainSection = () => {
    return (<>
    
      <div className='w-100 flex-col '>
        <div className='w-100 w-max-1080px'>
          <img src='/img/maintitle.png' 
            className='w-100 w-max-300px bord-r- Q_xs_px-0 pa-8 translate-y-50'  style={{
              background: "#4D4637",
              boxShadow: "-30px 30px 0 -10px #FFD23F",
            }} 
            />
        </div>
      </div>
    {/* <div className='  w-100 flex-col'
        style={{background: "linear-gradient(180deg, #4D4637, #FFF8E8)"}}
      >
        <div className='invisible'>.</div>
      </div> */}
  
  
  <div className='w-100 flex-col'
        // style={{background: "linear-gradient(180deg, #F4F5EF,  #ff9900 )"}}
        style={{background: "#F4F5EF"}}
        >
      <div className='w-100 flex-wrap gap-8  pt-100'
      style={{maxWidth: "800px"}}
      >
        {/* <img src='/img/articleplata.png' className='w-100 w-max-400px'  /> */}
        <img style={{}} src='/img/panel (1).png' className='w-100 w-max-300px bord-r-5'  />
        <img style={{}} src='/img/panel (2).png' className='w-100 w-max-400px bord-r-5'  />
        <img style={{}} src='/img/panel (3).png' className='w-100 w-max-200px bord-r-5'  />
        <img style={{}} src='/img/panel (4).png' className='w-100 w-max-300px bord-r-5'  />
        <img style={{}} src='/img/panel (5).png' className='w-100 w-max-200px bord-r-5'  />
  
        
        </div>
        </div>
        
      <div className='w-100 flex-wrap gap-8 pt-200'
        style={{background: "linear-gradient(0deg, #FFF8E8,  #FCEAAF, #F4F5EF )"}}
      >
        {/* <img src='/img/articleplata.png' className='w-100 w-max-400px'  /> */}
        <img style={{}} src='/img/product (1).png' className='w-100 w-max-300px bord-r-5'  />
        <img style={{}} src='/img/product (3).png' className='w-100 w-max-400px bord-r-5'  />
        <img style={{}} src='/img/product (2).png' className='w-100 w-max-200px bord-r-5'  />
  
        
        </div>
  

  
        <div className='w-100 flex-wrap gap-2 pt-200'
        style={{background: "#FFF8E8"}}
      >
        <img src='/img/article (1).png' className='w-100 w-max-400px'  />
        <img src='/img/banner1.png' className='w-100 w-max-400px'  />
        <img src='/img/somering.png' className='w-100 w-max-300px'  />
  
        
        </div>
        










        <div style={{background: "#FFF8E8"}} className='w-100 block'>
          <div className='py-200'></div>
        </div>
  
        
  
      <img src='/img/logopink.png' className='w-100 w-max-300px  bord-r-100p translate-y--50'  />
      {/* <img src='/img/mainbox.png' className='w-100 w-max-200px mb-100 bord-r-100p translate-y--50'  /> */}
  
      
      <div className='w-100 flex-wrap gap-8 pb-100 ' 
      // style={{background: "#FFF8E8"}}
      >
      <a className='flex-col nodeco tx-white opaci-chov--75' 
      href='https://www.instagram.com/carlotashop_' target='_blank'>
        <div className='pb-4  tx-altfont-1 opaci-75 tx-center tx-bold-8'>
          <FaInstagram className='tx-lx' />
          <div className='Q_sm_x tx-lx'><br />  Instagram <br /> Catalogue</div>
          <div className='Q_xs tx-lg'><br />  Instagram <br /> Catalogue</div>
        </div>
        <img src='/img/yellowlogo.png' className='w-100 bord-r-100 box-shadow-2-b w-max-300px Q_sm_x'  />
        <img src='/img/yellowlogo.png' className='w-100 bord-r-25 box-shadow-2-b w-max-100px Q_xs'  />
      </a>
        <a className='flex-col nodeco tx-white opaci-chov--75' 
        href='https://api.whatsapp.com/message/QVPL7P6JGWOVI1' target='_blank'>
          <div className='pb-4  tx-altfont-1 opaci-75 tx-center tx-bold-8'>
          <FaWhatsapp className='tx-lx' />
          <div className='Q_sm_x tx-lx'><br />  Whatsapp <br /> Catalogue</div>
          <div className='Q_xs tx-lg'><br />  Whatsapp <br /> Catalogue</div>
        </div>
          <img src='/img/pinklogo.png' className='w-100 bord-r-100 box-shadow-2-b w-max-300px Q_sm_x'  />
          <img src='/img/pinklogo.png' className='w-100 bord-r-25 box-shadow-2-b w-max-100px Q_xs'  />
        </a>
      </div>
  
      <img src='/img/star.png' className='w-100 w-max-150px  bord-r-100p translate-y-50'  />
      <div className='w-100 flex-col ' style={{
        // background: "#FFF7E6"
        background: "linear-gradient(0deg, #F9DC6C 25%, #FFF7E6 50%)"
      }}>
      <div className='Q_xs py-100 block'></div>
      <div className='Q_xs_sm py-8 block'></div>
  
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#4D4637" fill-opacity="1" d="M0,224L48,186.7C96,149,192,75,288,90.7C384,107,480,213,576,256C672,299,768,277,864,261.3C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg> */}
        <div className='h-100vh flex-col tx-altfont-1'>
        <h1 className='tx-xl Q_sm_x w-max-600px tx-center'>✨El toque ideal para <i className=''>tu estilo</i> en nuestra tienda.</h1>
        <h1 className='tx-lx Q_xs w-max-600px tx-center'>✨El toque ideal para <i className=''>tu estilo</i> en nuestra tienda.</h1>
          <div className='flex-wrap gap-8 flex-justify-center'>
          <div className='flex-col flex-align-start px-8 py-8   gap-4' 
            style={{
              background: "linear-gradient(45deg, #ffffff, #ffffff77)",
              boxShadow: "-5px 5px 10px #00000033, -30px 30px 0 -10px #FFD23F",
            }}
          >
            <div className='tx-lx Q_sm_x'>🛵 Delivery</div>
            <div className='tx-lx Q_sm_x'>🇻🇪   Envios Nacionales</div>
            <div className='tx-lx Q_sm_x'>📍 Anzoategui</div>
            <div className='tx-lx Q_sm_x'>Realza tu belleza 💖</div>
  
            <div className='tx-lg Q_xs'>🛵 Delivery</div>
            <div className='tx-lg Q_xs'>🇻🇪   Envios Nacionales</div>
            <div className='tx-lg Q_xs'>📍 Anzoategui</div>
            <div className='tx-lg Q_xs'>Realza tu belleza 💖</div>
          </div>
      <img src='/img/mainbox.png' className='w-200px bord-r-100p box-shadow-2-b '  />
  
      <div className='Q_xs py-100 w-100 block'></div>
      </div>
        </div>
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#FFC2B0" fill-opacity="1" d="M0,224L48,234.7C96,245,192,267,288,234.7C384,203,480,117,576,106.7C672,96,768,160,864,202.7C960,245,1056,267,1152,234.7C1248,203,1344,117,1392,74.7L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg> */}
  
      </div>
  
        <img src='/img/splitter1.png' className='w-100 block Q_sm_x' />
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#FFD23F" fill-opacity="1" d="M0,224L48,186.7C96,149,192,75,288,90.7C384,107,480,213,576,256C672,299,768,277,864,261.3C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg> */}
  
  
        {/* <img src='/img/screen (5).png' className='w-100 w-max-300px bord-r-25'  /> */}
      {/* <img src='/img/mobile2.png' className='w-100 w-max-300px bord-r-25'  /> */}
  
  
    </>)
  }
  export const FooterSection = () => {
    return (<>
      
      
      <div className=' w-100  flex-col py-8' style={{background: "#FFF7E6"}}>
      <div className=' w-100  w-max-1080px' >
    <h1 className='tx-altfont-1 tx-bold-2 mb-4'>
      {/* Important Links: */}
      <img src="/img/logosmall.png" style={{
                    boxShadow: "-10px 10px 0 0px #FFD23F",
  
  
      }} />
    </h1>
    <div className='Q_xs_flex-col flex-wrap flex-align-start flex-justify-around'>
      <div className='mb-8 flex-col px-4 flex-align-start tx-altfont-1'>
        <h2 className='tx-altfont-1 tx-bold-1'>Contact:</h2>
        <div className='flex-col flex-align-start tx-lg'>
          {/* <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://twitter.com/mileisolcoin">
            <FaTwitter /> Twitter / X
          </a> */}
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://t.me/mileisolcoin/">
            <FaWhatsapp /> Whatsapp
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://www.youtube.com/@JavierMileiSolana">
            <FaInstagram /> Instagram
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://tiktok.com/@mileisolcoin">
            <FaTiktok /> TikTok
          </a>
          {/* <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://www.tiktok.com/@mileisolcoin">
            <FaTiktok /> TikTok
          </a> */}
          {/* <a className='opaci-chov--50 tx-black nodeco opaci-50 pa-2 px-4' >TikTok (Soon)</a>
          <a className='opaci-chov--50 tx-black nodeco opaci-50 pa-2 px-4' >Youtube (Soon)</a> */}
        </div>
      </div>
  
      <div className='mb-8 flex-col px-4 flex-align-start tx-altfont-1'>
        <h2 className='tx-altfont-1 tx-bold-1'>Categories:</h2>
        <div className='flex-col flex-align-start tx-lg'>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://jup.ag/swap/SOL-MILEI">
            <FaHandBackFist /> Pulseras
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://www.coingecko.com/en/coins/milei-solana">
            <FaEarListen /> Zarcillos
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://www.coingecko.com/en/coins/milei-solana">
            <FaGlasses /> Lentes
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://www.coingecko.com/en/coins/milei-solana">
            <TbShoe /> Tobilleras
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://dexscreener.com/solana/43N5UGr3mnfhJFzpBPNM7ZdnobghiYBtHTaQfZQv65mh">
            <FaEarDeaf /> Ear Puffs
          </a>
          </div>
      </div>
  
      <div className='mb-8 flex-col px-4 flex-align-start tx-altfont-1'>
        <h2 className='tx-altfont-1 tx-bold-1'>Promos:</h2>
        <div className='flex-col flex-align-start tx-lg'>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://solscan.io/token/43N5UGr3mnfhJFzpBPNM7ZdnobghiYBtHTaQfZQv65mh">
            <FaSun /> 2024 Summer
          </a>
          <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://solscan.io/token/43N5UGr3mnfhJFzpBPNM7ZdnobghiYBtHTaQfZQv65mh">
            <FaMoon /> 2024 Winter
          </a>
          {/* <a className='opaci-chov--50 tx-black nodeco pa-2 px-4' target='_blank' href="https://github.com/SrMessiETH">
            <FaGithub /> Github
          </a> */}
        </div>
      </div>
    </div>
  </div>
  </div>
  
  
    </>)
  }