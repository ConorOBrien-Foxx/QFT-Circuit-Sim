const getTextWidth = (text, size) => {
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext("2d");
	ctx.font = `${size || 16}px "Ubuntu Mono", monospace`;
	return ctx.measureText(text).width;
}

class Tile {
	constructor(x, y, design, width, height){
		this.x = x;
		this.y = y;
		this.width = width || 1;
		this.height = height || 1;
		this.rot = 0;
		this.design = design || {};
		this.textElement = null;
		this.rectElement = null;
	}
}

const padFactor = 1.2;
const gateColor = "#45CBF7";

class GateDesign {
	constructor(name, attr, inputs, outputs){
		this.attributes = attr || {};
		this.attributes.fill = gateColor;
		this.name = name;
		this.inputs = inputs;
		this.outputs = outputs;
	}
}

const XORDesign = new GateDesign("xor");
const ORDesign = new GateDesign("or");
const ANDDesign = new GateDesign("and");

class Grid {
	/*
	 * width and height are given in number of tiles
	 * cellWidth is the display size of a cell
	 */
	constructor(width, height, cellWidth, svg, moveable){
		this.tiles = [];
		this.width = width;
		this.height = height;
		this.cellWidth = cellWidth;
		this.svg = svg;
		this.moveable = moveable;
	}
	
	pushTile(tile){
		if(!(tile instanceof Tile)){
			let chopped = JSON.stringify(tile);
			let sliced = chopped.slice(0, 10);
			if(sliced !== chopped) sliced += "..." + chopped.slice(-1);
			let name = tile.constructor.name.toLowerCase();
			
			throw new Error(`argument 0 is not a Tile, ${sliced} is a${/[aeiou]/.test(name[0]) ? "n" : ""} ${name}`);
		}
		
		this.tiles.push(tile);
		let rect = this.svg.append("rect");
		let nx = tile.x + padFactor * this.cellWidth * tile.x;
		let ny = tile.y + padFactor * this.cellWidth * tile.y;
		rect.attr("x", nx)
			.attr("y", ny)
			.attr("width", this.cellWidth * tile.width)
			.attr("height", this.cellWidth * tile.height)
			.attr("fill", "grey")
			.attr("class", "tile")
		tile.rectElement = rect;
		
		let text = this.svg.append("text");
		tile.textElement = text;
		text.attr("x", nx + (tile.width * this.cellWidth - getTextWidth(tile.design.name, 0.32 * this.cellWidth))/2)
			.attr("y", ny + 4 + this.cellWidth / 2)
			.attr("font-size", "16")
			.attr("class", "name")
			.text(tile.design.name);
		
		for(let i in tile.design.attributes){
			rect.attr(i, tile.design.attributes[i]);
		}
		
		if(this.moveable)
			rect.call(drag(this, tile));
	}
	
	addTile(...args){
		this.pushTile(new Tile(...args));
	}
	
	init(){
		this.svg.attr("width", this.cellWidth * this.width)
				.attr("height", this.cellWidth * this.height);
	}
	
	/*
	 * Grid#update
	 * for updating the widths of tiles
	 */
	update(){
		let rcts = this.svg.selectAll("rect.tile").data(this.tiles);
		rcts.attr("width", tile => this.cellWidth * tile.width)
			.attr("height", tile => this.cellWidth * tile.width);
		let txts = this.svg.selectAll("text.name").data(this.tiles);
		txts.attr("x", tile => {
			let nx = parseInt(tile.rectElement.attr("x"), 10);
			return nx + (tile.width * this.cellWidth - getTextWidth(tile.design.name, 0.32 * this.cellWidth))/2;
		})
		.attr("y", tile => {
			let ny = parseInt(tile.rectElement.attr("y"), 10);
			return ny + 0.08 * this.cellWidth + this.cellWidth / 2;
		})
		.attr("font-size", 0.32 * this.cellWidth)
	}
}

// our drag effect
let drag = function(b, tile){
	return d3.behavior.drag().on("drag", function(){
		let t = d3.select(this);
		let sx = Math.floor(d3.event.x / (b.cellWidth * padFactor));
		let nx = sx * b.cellWidth * padFactor + 1;
		let sy = Math.floor(d3.event.y / (b.cellWidth * padFactor));
		let ny =  sy * b.cellWidth * padFactor + 1.2;
		t.attr("x", nx).attr("y", ny);
		tile.textElement.attr("x", nx + (tile.width * b.cellWidth - getTextWidth(tile.design.name, 0.32 * b.cellWidth))/2)
						.attr("y", ny + 4 + b.cellWidth / 2);
	});
}


// various ids
let cellSize;
let update;
let svg;
let bldr;
let builder
let board;
// let field;


window.addEventListener("load", function(){
	svg = d3.select("svg#board");
	bldr = d3.select("svg#builder");
	// field = document.querySelector("svg");

	builder = new Grid(1, 5, 50, bldr, false);
	builder.addTile(0, 0, XORDesign);
	builder.addTile(0, 1, ORDesign);
	builder.addTile(0, 2, ANDDesign);
	
	builder.init();
	
	d3.selectAll("#builder .tile").on("click", x => alert("click"));

	board = new Grid(5, 5, 50, svg, true);

	board.addTile(0, 2, XORDesign);
	board.addTile(1, 2, ORDesign);
	board.addTile(2, 2, ANDDesign);
	board.addTile(2, 1, XORDesign);
	board.addTile(1, 0, ORDesign);
	
	board.init();
	
	cellSize = document.getElementById("cellSize");
	update = document.getElementById("update");
	update.addEventListener("click", function(){
		board.cellWidth = parseInt(cellSize.value, 10);
		board.update();
	});
	
	// d3.selectAll("#board rect.tile").call(drag(board));
	// d3.selectAll("#builder rect.tile").call(drag(builder));
});



