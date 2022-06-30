import { TokenList } from "@uniswap/token-lists";
import { REPO_BASE_URL } from "../config";
import { downloadFile } from "../utils/images";
import { AssetRepoObject } from "./AssetRepoObject";
import { NetworkInfo } from "./NetworkInfo";
import { TokenInfo } from "./TokenInfo";
import { Logos } from "./types";

export function getMap3LogoUri(): string {
    // TODO
    return "";
}

export function getLogoUriFromInfo(info: AssetRepoObject, dir: string): string {
    // TODO for a given info object, get the URI of the logo. PNG > SVG by default
    return "";
}

export async function getNetworkInfoFromTokenlist(tokenlist: TokenList): Promise<NetworkInfo> {
    // TODO: parse a tokenlist and return a Network object, getting it remotely from the master branch via HTTP
    return Promise.resolve(null); 
}

export async function downloadAndPersistLogos(logo: Logos, directory: string): Promise<Logos> {
    let res = {
        ...logo
    }

    try {
        if(logo.png.github) {
            await downloadFile(logo.png.github, directory, 'logo.png');
            res.png.github = `${REPO_BASE_URL}/networks${directory.split("/networks")[1]}/logo.png`;
            res.png.ipfs = null;
            res.png.cdn = null;
            // TODO: upload PNG to IPFS and get link.
        }
    
        if(logo.svg) {
            await downloadFile(logo.svg.github, directory, 'logo.svg');
            res.svg.github = `${REPO_BASE_URL}/networks${directory.split("/networks")[1]}/logo.svg`;
            res.png.ipfs = null;
            res.png.cdn = null;
            // TODO: upload SVG to IPFS and get link.
        }

        return res;
    } catch (err) {
        throw err;
    }
}