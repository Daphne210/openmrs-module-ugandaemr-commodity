import {  URL_PRINT_LOGO } from "../../config";

export interface PrintLogoData {
    image: string;
    isSvg: boolean
}


export const GetPrintLogo = (): Promise<PrintLogoData | null> => {
    const printLogoUrl: string = URL_PRINT_LOGO();
    return new Promise((resolve, reject) => {        
        if (!printLogoUrl) {
            resolve(null);
            return;
        }

        var hdnTxtPrintLogo = document.getElementById("hdnTxtPrintLogo") as HTMLTextAreaElement;
        if (hdnTxtPrintLogo && hdnTxtPrintLogo.value?.length > 0) {
            let isSvg = hdnTxtPrintLogo.getAttribute("isSvg");
            resolve({ image: (hdnTxtPrintLogo as HTMLTextAreaElement).value, isSvg: isSvg === "1" });
            return;
        }

        if (printLogoUrl.toLowerCase().endsWith(".svg")) {
            fetch(printLogoUrl, {
                headers: {
                    'Disable-WWW-Authenticate': 'true'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Print logo fetch network response was not OK');
                }
                return response.text();
            }).then(svg => {
                if (hdnTxtPrintLogo) {
                    hdnTxtPrintLogo.value = svg;
                    hdnTxtPrintLogo.setAttribute("isSvg", "1");
                }
                resolve({ image: svg, isSvg: true });
            }).catch((error) => {
                console.error('Error fetching print logo: ', error);
                reject('Error fetching print logo');
            });
        }
        else {
            const img = new Image();
            const onImageLoaded = () => {
                try {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        var dataURL = canvas.toDataURL("image/png");
                        if (hdnTxtPrintLogo) {
                            hdnTxtPrintLogo.value = dataURL;
                            hdnTxtPrintLogo.setAttribute("isSvg", "0");
                        }
                        resolve({ image: dataURL, isSvg: false });
                    } else {
                        reject("Failed to allocate canvas context for print logo");
                    }
                } catch (e) {
                    reject(e);
                }
            }
            const onImageLoadError = (ev: ErrorEvent) => {
                reject(ev);
            }
            img.addEventListener('load', onImageLoaded);
            img.addEventListener('error', onImageLoadError);
            img.src = printLogoUrl;
        }
    });
}
