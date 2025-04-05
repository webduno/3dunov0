import { FaPlusCircle } from "react-icons/fa"

export const ShopSection = () => {
    return (<>
        <div className="flex-col w-100 tx-altfont-1 gap-2 w-max-1080px">
            <div className="">Carlota Shop App</div>
            <div>
                <div className="flex w-100 w-max-300px ">
                    <div className="flex-1 flex-col tx-lg ">
                        <input className="px-4 py-2 bord-r-l-50" type="text" placeholder="Search" style={{
                            background: "#e6e6e4",
                            border: "1px solid #d6d6d4"
                        }} />
                    </div>
                    <div className="bord-r-r-50 flex-col opaci-chov--50 " style={{
                            background: "#e6e6e4",
                            border: "1px solid #d6d6d4"
                        }}>
                            <div className="px-3">?</div>
                            </div>
                </div>
            </div>
            <div className="flex-col">
            <div className="flex">
            <div className="">
            <div className="tx-xl flex-center tx-ls-5 mt-8 mb-3">✨<div className="opaci-30">Featured</div></div>
            <div className="flex-col gap-2">
                <div className="pa-8 bord-r-50 box-shadow-1-b"
                    style={{background: "linear-gradient(130deg, #ffffff, #efefef)"}}
                >
                    <div>
                        <div className="flex-col gap-2"> 
                            <img src="/img/article (2).png" alt="" width={300} className="bord-r-5 Q_sm_x" />
                            <img src="/img/article (2).png" alt="" width={150} className="bord-r-5 Q_xs" />
                            <div>
                                Ring #11 (S-24)
                            </div>
                            <div className="tx-white gap-2 flex-center px-4 py-2 bord-r-10 opaci-chov--75" style={{background: "#9D7458"}}>
                                <div>Add</div> <div className="pt-1"><FaPlusCircle /></div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                </div>
                <div className="Q_md_x mt-100 pl-8">
                    <div className="tx-lx">Ring  Nº11 (#Summer24)</div>
                    <details>
                        <summary className="flex-col flex-align-start flex-justify-start tx-lg opaci-chov--50 py-4 ">
                            <div>Details</div>
                            <hr className="w-100 opaci-10 my-1" />
                            <div className="w-max-300px">
                                Oro 24K 18mm pulido con patron
                            </div>
                        </summary>
                        <div className="w-max-300px">
                            Estos accesorios circulares no solo adornan nuestras manos, sino que también hablan de nuestra personalidad, estilo y hasta estado civil.
                        </div>
                    </details>
                </div>
                </div>
                <hr className="w-100 opaci-10 my-100" />

            <div className="tx-xl opaci-30 tx-ls-5 w-100 tx-center py-8">Rings</div>
            <div className="flex-wrap gap-3">
                    
                <div className="pa-8 bord-r-50 box-shadow-1-b"
                        style={{background: "linear-gradient(130deg, #ffffff, #efefef)"}}
                    >
                        <div>
                            <div className="flex-col "> 
                                <img src="/img/article (4).png" alt="" width={300} className="bord-r-t-50 bord-r-5 Q_sm_x" />
                                <img src="/img/article (4).png" alt="" width={150} className="bord-r-t-50 bord-r-5 Q_xs" />
                                <div className="w-100 flex-col gap-1 tx-center tx-white px-4 py-2 bord-r-b-50 opaci-chov--75" style={{background: "#9D7458"}}>
                                    <div className="tx-ls-5">
                                        Ring #57
                                    </div>
                                    <div className="tx-bold-8">$1.99</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pa-8 bord-r-50 box-shadow-1-b"
                        style={{background: "linear-gradient(130deg, #ffffff, #efefef)"}}
                    >
                        <div>
                            <div className="flex-col "> 
                                <img src="/img/article (4).png" alt="" width={300} className="bord-r-t-50 bord-r-5 Q_sm_x" />
                                <img src="/img/article (4).png" alt="" width={150} className="bord-r-t-50 bord-r-5 Q_xs" />
                                <div className="w-100 flex-col gap-1 tx-center tx-white px-4 py-2 bord-r-b-50 opaci-chov--75" style={{background: "#9D7458"}}>
                                    <div className="tx-ls-5">
                                        Ring #57
                                    </div>
                                    <div className="tx-bold-8">$1.99</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pa-8 bord-r-50 box-shadow-1-b"
                        style={{background: "linear-gradient(130deg, #ffffff, #efefef)"}}
                    >
                        <div>
                            <div className="flex-col "> 
                                <img src="/img/article (4).png" alt="" width={300} className="bord-r-t-50 bord-r-5 Q_sm_x" />
                                <img src="/img/article (4).png" alt="" width={150} className="bord-r-t-50 bord-r-5 Q_xs" />
                                <div className="w-100 flex-col gap-1 tx-center tx-white px-4 py-2 bord-r-b-50 opaci-chov--75" style={{background: "#9D7458"}}>
                                    <div className="tx-ls-5">
                                        Ring #57
                                    </div>
                                    <div className="tx-bold-8">$1.99</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="w-100 opaci-10 my-100" />
                <div className="flex-col opaci-chov--50" id="checkout">
      <img src='/img/mainbox.png' className='w-100 w-max-200px  bord-r-100p translate-y--'  />

                <div className="tx-white px-8 py-2 w-100 w-max-300px bord-r-100 tx-center tx-altfont-1 tx-bold-8 tx-lgx mt-4 " 
                    style={{
                        background: "#9D7458",
                    }}
                >
                    Checkout
                </div>
                </div>
            </div>
        </div>
    </>)
}