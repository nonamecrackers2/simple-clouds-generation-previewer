class Type
{
    constructor(color, scale, areaScale, priority)
    {
        this.seed = Math.random();
        this.sampler = openSimplexNoise(this.seed);
        this.color = color;
        this.scale = scale;
        this.areaScale = areaScale;
        this.priority = priority;
    }
    
    getValue(x, y)
    {
        return this.sampler.noise2D(x / this.scale, y / this.scale) * this.priority - this.areaScale;
    }
}

function getTypeAt(x, y)
{
    var currentValue = null;
    var currentType = null;
    for (var i = 0; i < types.length; i++)
    {
        var type = types[i];
        var value = type.getValue(x, y);
        if (currentValue == null || value > currentValue)
        {
            currentValue = value
            currentType = type;
        }
    }
    return currentType;
}

const types = [
    new Type([0, 0, 0], 1000.0, 0.3, 1.0),
    new Type([255, 0, 0], 2000.0, 0.2, 1.0),
   // new Type([0, 255, 0], 5000.0, 0.5, 1.0),
   // new Type([255, 255, 255], 10000.0, 0.0, 10.0)
];

const canvas = document.getElementById('canvas');
const width = canvas.width;
const height = canvas.height;

const info = document.getElementById('info');
info.innerHTML = 'Chunk radius: ' + (width - 1) / 2 + ", " + width + "x" + height;

const context = canvas.getContext('2d');
const imageData = context.createImageData(width, height);

const slider = document.getElementById('scale');
const scaleInfo = document.getElementById('scaleInfo');
scaleInfo.innerHTML = 'Scale: ' + slider.value;
var scale = 1;
slider.oninput = function() 
{
    scale = this.value;
    document.getElementById('scaleInfo').innerHTML = 'Scale: ' + this.value;
    document.getElementById('info').innerHTML = 'Chunk radius: ' + (width * scale - 1) / 2 + ", " + width * scale + "x" + height * scale;
    draw();
}

draw();

function draw()
{
    var centerX = Math.floor(width / 2.0);
    var centerY = Math.floor(height / 2.0);
    var radius = Math.floor((width - 1.0) / 2.0);
    var x, y, index = 0;
    for (y = 0; y < height; y++) 
    {
        for (x = 0; x < width; x++) 
        {
            var actualX = (x + centerX) * 16.0 * scale;
            var actualY = (y + centerY) * 16.0 * scale;
            var type = getTypeAt(actualX, actualY);
            if (scale != 1 && (isAround(x*scale, centerX+radius*scale, 16.0) || isAround(y*scale, centerY+radius*scale, 16.0) || isAround(x*-scale, centerX-radius*scale, 16.0) || isAround(y*-scale, centerY-radius*scale, 16.0)))
            {
                imageData.data[index++] = 0;
                imageData.data[index++] = 0;
                imageData.data[index++] = 255;
                imageData.data[index++] = 255;
            }
            else if (type != null)
            {
                imageData.data[index++] = type.color[0];
                imageData.data[index++] = type.color[1];
                imageData.data[index++] = type.color[2];
                imageData.data[index++] = 255;
            }
        }
    }
    context.putImageData(imageData, 0, 0)
}

function isAround(num1, num2, bound)
{
    if (num1 <= num2 + bound && num1 >= num2 - bound)
    {
       return true;
    }
    else
    {
        return false;
    }
}

function refresh()
{
    for (var i = 0; i < types.length; i++)
    {
        types[i].seed = Math.random();
        types[i].sampler = openSimplexNoise(types[i].seed);
    }
    draw();
}