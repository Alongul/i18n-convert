import * as md5 from "js-md5";
import * as request from "request";
import * as vscode from "vscode";
import { SidebarProvider } from "../webview/siderBar";

let moduleName = "";
let appid = "";
const salt = "123";
let secretKey = "";

export function transformText(
  input: string,
  context: vscode.ExtensionContext,
  sidebarProvider: SidebarProvider
): Promise<string> | null {
  let info = JSON.parse(context.globalState.get("info") || "");
  moduleName = info?.moduleName || "";
  appid = info?.appid || "";
  secretKey = info?.secretKey || "";
  if (!appid || !secretKey || !moduleName) {
    return null;
  }
  return new Promise((resolve, reject) => {
    let reg =
      /(?<!(\/\/|\*|\<\!\-\-).*)[a-zA-Z0-9（）]*[\u4e00-\u9fa5]{2,}[a-zA-Z0-9（），：\u4e00-\u9fa5\-\/]*[\:\：\？\?！]?/g;
    let allzh = input.match(reg) || [];
    if (allzh.length !== 0) {
      getConfig(allzh).then((res) => {
        zhObjToEn(res).then((en) => {
          let configStrZh = `{<br/>` + objToString(res) + `}<br/>`;
          let configStrEn = `{<br/>` + objToString(en) + `}`;
          sidebarProvider.webview?.postMessage(configStrZh + configStrEn);
        });
        resolve(
          JSON.stringify({
            text: toReplace(input, res, moduleName),
            config: res,
          })
        );
      });
    }
  });
}
function getConfig(arrParam: string[]): Promise<{ [key: string]: string }> {
  return new Promise((resolve, reject) => {
    let res: { [key: string]: string } = {};
    let str = arrParam.join("_");
    translate(str).then((item) => {
      let dst = item;
      let enArr = dst.split("_ ");
      for (let i = 0; i < enArr.length; i++) {
        let arr = enArr[i].toLowerCase().split(" ");
        arr = arr.map((item: string, index: number) => {
          if (index !== 0) {
            return item.replace(/^./g, item.charAt(0).toUpperCase());
          } else {
            return item;
          }
        });
        let resKey = arr
          .join("")
          .replace(":", "Col")
          .replace(/\(.*\)/g, "")
          .replace(/[,，！\!\-\?\/\']/g, "");
        res[resKey] = arrParam[i];
      }
      resolve(res);
    });
  });
}

function toReplace(str: string, obj: { [key: string]: string }, moduleName: string): string {
  Object.entries(obj).forEach(([key, value]) => {
    // 不匹配注释内容 ，同时解决父串包含子串被子串替换的问题
    let reg = new RegExp(
      String.raw`(?<![\"\'\u4e00-\u9fa5]|(\/\/|\*).*)${value}(?!.*[\"\'\*\u4e00-\u9fa5])`,
      "g"
    );
    // 匹配 "" , ''内容
    let reg1 = new RegExp(String.raw`(?<!=)[\"\']${value}\?*[\"\']`, "g");
    str = str
      .replaceAll(`label="${value}"`, `:label="$t('${moduleName}.${key}')"`)
      .replaceAll(`title="${value}"`, `:title="$t('${moduleName}.${key}')"`)
      .replaceAll(`placeholder="${value}"`, `:placeholder="$t('${moduleName}.${key}')"`)
      .replaceAll(reg, `{{$t('${moduleName}.${key}')}}`);

    str = str.replaceAll(reg1, `this.$t('${moduleName}.${key}')`);
  });
  // 替换公共部分汉字
  // Object.entries(commonObj).forEach(([pkey, pvalue]) => {
  //     Object.entries(pvalue).forEach(([key, value]) => {
  //         let reg = new RegExp(`(?<![\"\'\u4e00-\u9fa5]|(\/\/).*)${value}(?!.*[\"\'\*\u4e00-\u9fa5])`, 'g')
  //         let reg1 = new RegExp(`(?<!=)[\"\']${value}[\"\']`, 'g')
  //         str = str.replaceAll(`label="${value}"`, `:label="$t('${pkey}.${key}')"`)
  //             .replaceAll(`title="${value}"`, `:title="$t('${pkey}.${key}')"`)
  //             .replaceAll(`placeholder="${value}"`, `:placeholder="$t('${pkey}.${key}')"`)
  //             .replaceAll(reg, `{{$t('${pkey}.${key}')}}`)

  //         str = str.replaceAll(reg1, `this.$t('${pkey}.${key}')`)
  //     })
  // })
  return str;
}

function zhObjToEn(obj: { [key: string]: string }): Promise<{ [key: string]: string }> {
  return new Promise((resolve, reject) => {
    let res = { ...obj };
    let tranStr = Object.values(obj).join("_");
    translate(tranStr).then((data) => {
      let enArr = data.split("_ ");
      Object.keys(res).forEach((item, index) => {
        res[item] = enArr[index];
      });
      resolve(res);
    });
  });
}

function translate(str: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let q = str;
    let sign = md5(`${appid}${q}${salt}${secretKey}`);
    let url = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(
      q
    )}&from=zh&to=en&appid=${appid}&salt=${salt}&sign=${sign}`;
    request(
      {
        url,
        method: "GET",
      },
      function (error, response, body) {
        if (error) {
          console.log(error);
        }
        resolve(JSON.parse(body).trans_result[0].dst);
      }
    );
  });
}

export function objToString(obj: { [key: string]: string }): string {
  let str = "";
  Object.entries(obj).forEach(([key, value]) => {
    str += `${key}:'${value}',<br/>`;
  });
  return str;
}
// const langFileUrl = 'src/test/lang';
// function createFile(){
//     fs.mkdir(langFileUrl, { recursive: true },(err,path)=>{
//         console.log(path);
//         // fs.writeFile(`${path}`)
//     });
// }
