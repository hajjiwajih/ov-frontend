import { Injectable } from "@angular/core";
/**
 * @interface script definition for each loaded script
 */
interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts[] = [
  { name: "main", src: "../../assets/scripts/main.js" },
  { name: "custom", src: "../../assets/scripts/custom.js" },
];

declare var document: any;

@Injectable({
  providedIn: "root",
})

/**
 * @service DynamicScriptLoaderService: used for script injection dynamically
 */
export class DynamicScriptLoaderService {
  private scripts: any = {};
  private script: any;

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src,
      };
    });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      if (true) {
        //load script
        let script = document.createElement("script");
        script.type = "text/javascript";
        script.src = this.scripts[name].src;
        script.id = "_custom";
        if (script.readyState) {
          //IE
          script.onreadystatechange = () => {
            if (
              script.readyState === "loaded" ||
              script.readyState === "complete"
            ) {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: "Loaded" });
            }
          };
        } else {
          //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: "Loaded" });
          };
        }
        script.onerror = (error: any) =>
          resolve({ script: name, loaded: false, status: "Loaded" });
        let child = document.getElementById("_custom");
        console.log(child);
        if (child) {
          // remove previous added
          document
            .getElementsByTagName("head")[0]
            .removeChild(
              document.getElementsByTagName("head")[0].lastElementChild
            );
          document
            .getElementsByTagName("head")[0]
            .removeChild(
              document.getElementsByTagName("head")[0].lastElementChild
            );
          document.getElementsByTagName("head")[0].removeChild(child);
        }
        document.getElementsByTagName("head")[0].appendChild(script);
        this.script = script;
      } else {
        resolve({ script: name, loaded: true, status: "Already Loaded" });
      }
    });
  }
}
