//The base for all objects displayed on the screen. Handles basic positioning and implements base versions of all required functions for UI Components.
// const Graphics = require('./Graphics.js');
const {ivec2, uvec2} = require('./VLightingMath.js');
const ft = require('freetype2');
const getSystemFonts = require('get-system-fonts');
const path = require('path');
const fs = require('fs');

class Component {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  anchor = Anchor.TOPLEFT;
  text = "";
  id = "";

  constructor(opts){
    let {x =this.x, y=this.y, width=this.width, height=this.height, anchor=this.anchor, text=this.text, id=this.id} = opts;
    if (typeof id == 'string') {
      this.id == string;
    } else throw new TypeError("Component: id must be specified and of type string. Got type '" + (id == null? 'null': id.constructor.name) + "'");

    if (!Number.isNaN(x) && x != Infinity && x != -Infinity) {
      this.x = x;
    } else {
      throw new TypeError('Component: x must be a valid finite number.');
    }

    if (!Number.isNaN(y) && y != Infinity && y != -Infinity) {
      this.y = y;
    } else {
      throw new TypeError('Component: y must be a valid finite number.');
    }

    if (!Number.isNaN(width) && width != Infinity && width != -Infinity) {
      this.width = width;
    } else {
      throw new TypeError('Component: width must be a valid finite number.');
    }

    if (!Number.isNaN(height) && height != Infinity && height != -Infinity) {
      this.height = height;
    } else {
      throw new TypeError('Component: height must be a valid finite number.');
    }

    if (typeof anchor != 'undefined') {
      if (anchor instanceof Anchor) {
        this.anchor = anchor;
      } else {
        throw new TypeError("Component: anchor must be instance of Anchor. Got '" + anchor.constructor.name + "'")
      }
    }

    if (typeof text != 'undefined') {
      if(!anchor.toString) throw new TypeError("Component: text must be either a string or a value that can be converted to string. Got '" + anchor.constructor.name + "'");
      this.anchor = anchor.toString();
    }

  }

  draw(){

  }
}

class TextUtils {
  static #codePages = [0x0, 0x2500];

  //Stores a map of font names to an object storing the path and format of the font.
  static #fontPathMap = new Map();

  //A map from font names to the data and characters for a font.
  static #fontDataMap = new Map();

  static loadFont(name){
    let details = fontPathMap.get(name);
    if (!details) throw new Error("Failed to load font '" + name + "'. Could not find the font on disk. If the font is a custom font make sure the file is placed in the fonts folder of the project.");
    let data = fs.readFileSync(details.path);
    let face = {};
    if (ft.New_Memory_Face(data, 0, face)) throw new Error("TextUtils: Failed to create font face for font '" + name + "'");
    ft.Set_Pixel_Sizes(face, 0, 48);
    ft.Select_Charmap(face, ft.ENCODING_UNICODE);
    let fontData = {};
    fontData.pages = new Map();
    fontData.characters = new Map();
    ft.Load_Char(face, "a".charCodeAt(0), ft.LOAD_RENDER);
    console.log(face.glyph.bitmap.buffer);
    // for (let start of TextUtils.#codePages) {
    //   let pageData = {w: 0, h: 0};
    //   for (let i = start; i < start + 0xFF; i ++) {
    //     let charData = {uv: new uvec2(0,0), size: new uvec2(0,0), bearing: new uvec2(0,0), advance: 0};
    //     if (ft.Load_Char(face, i, ft.LOAD_RENDER)) throw new Error("TextUtils: failed to load glyph for unicode point '\\u+" + i.toString(16) + "' (" + String.fromCharCode(i) + ")");
    //     //charData.bitmap = new Uint8Array(face.glyph.bitmap.buffer);
    //
    //     fontData.characters.set(i, charData)
    //   }
    //   fontData.pages.set(start, pageData);
    // }
    TextUtils.#fontDataMap.set(name, fontData)
    // if (ft.Load_Char(face, ));
  }

  static async init(){
    let fontFolder = path.resolve('fonts');
    let paths = await getSystemFonts({additionalFolders: [fontFolder]});
    for (let fontPath of paths) {
      let details = path.parse(fontPath);
      let format = details.ext;
      let name = details.name;
      TextUtils.#fontPathMap.set(name, {path: fontPath, format});
    }

  }
}


TextUtils.init();
TextUtils.loadFont('Arial');





class Anchor extends Symbol {}
Object.defineProperties(Anchor, {
  TOPLEFT: {value: new Anchor()},TOPMIDDLE: {value: new Anchor()},TOPRIGHT: {value: new Anchor()},
  LEFT: {value: new Anchor()},MIDDLE: {value: new Anchor()},RIGHT: {value: new Anchor()},
  BOTTOMLEFT: {value: new Anchor()},BOTTOMMIDDLE: {value: new Anchor()},BOTTOMRIGHT: {value: new Anchor()},
})
