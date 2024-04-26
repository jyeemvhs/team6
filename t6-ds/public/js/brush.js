export default class Brush {
    static #FILL = new Brush("paintBucket", false, true);
    static #STANDARD = new Brush("standard", false);
    static #ERASER = new Brush("eraser", false);
    static #RECT = new Brush("rectButton");
    static #LINE = new Brush("lineButton");
    static #CIRCLE = new Brush("circleButton");
    static #TREE = new Brush("treeButton");

    static values = [this.#FILL, this.#STANDARD, this.#ERASER, this.#RECT, this.#LINE, this.#CIRCLE, this.#TREE];
    
    static get FILL() { return this.#FILL; }
    static get STANDARD() { return this.#STANDARD; }
    static get ERASER() { return this.#ERASER; }
    static get RECT() { return this.#RECT; }
    static get LINE() { return this.#LINE; }
    static get CIRCLE() { return this.#CIRCLE; }
    static get TREE() { return this.#TREE; }

    static get values() {
        return this.values;
    }

    static brushFromId(id) {
        for (let brush of this.values) {
            if (id == brush.htmlId) return brush;
        }

        return null;
    }

    static disableButton(curr) {
        for (let brush of this.values) {
            if (curr == brush) $(`#${brush.htmlId}`).attr("disabled", true);
            else $(`#${brush.htmlId}`).attr("disabled", null);
        }
    }

    constructor(htmlId, stamp=true, singl=false) {
        this.id = htmlId;
        this.st = stamp;
        this.single = singl;
    }

    get singleClick() {
        return this.single;
    }

    get stamp() {
        return this.st;
    }

    get htmlId() {
        return this.id;
    }
}