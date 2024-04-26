export default class Color {

    static FromImageData(d) {
        return new Color(d.data[0],d.data[1],d.data[2],d.data[3]);
    }

    static FromData(d) {
        return new Color(d[0],d[1],d[2],d[3]);
    }

    static FromHexColor(str) {
        let r = parseInt(str.substr(1, 2), 16);
        let g = parseInt(str.substr(3, 2), 16);
        let b = parseInt(str.substr(5, 2), 16);
    
        return new Color(r,g,b);
    }

    constructor(rVal,gVal,bVal,aVal=1) {
        this.r = rVal;
        this.g = gVal;
        this.b = bVal;
        this.a = aVal;
    }

    get red() {
        return this.r;
    }

    get green() {
        return this.g;
    }

    get blue() {
        return this.b;
    }

    get alpha() {
        return this.a;
    }

    toString() {
        return `#${this.r.toString(16)}${this.g.toString(16)}${this.b.toString(16)}`
    }

    equals(col) {
        if (col == null) return false;
        return this.r == col.r && this.g == col.g && this.b == col.b && this.a == col.a;
    }

}