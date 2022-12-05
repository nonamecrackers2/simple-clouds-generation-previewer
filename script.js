class Type
{
    constructor(name, color, scale, areaScale, priority)
    {
        this.name = name;
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
    new Type('test', [0, 0, 0], 1000.0, 0.3, 1.0),
    new Type('test2', [255, 0, 0], 2000.0, 0.2, 1.0),
    new Type('test3', [0, 255, 0], 5000.0, 0.5, 1.0),
    new Type('test4', [255, 255, 255], 10000.0, 0.0, 10.0)
];

for (var i = 0; i < types.length; i++)
{
    var type = types[i];
    const div = document.createElement('div');
    div.setAttribute('id', type.name);
    document.getElementById('types').appendChild(div);
    const text = document.createElement('h3');
    text.innerHTML = type.name;
    div.appendChild(text);
}

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
    var visibleBorder = 16.0*(scale/8.0);
    var x, y, index = 0;
    for (y = 0; y < height; y++) 
    {
        for (x = 0; x < width; x++) 
        {
            var actualX = (x - centerX) * 16.0 * scale;
            var actualY = (y - centerY) * 16.0 * scale;
            var type = getTypeAt(actualX, actualY);
            if (type != null)
            {
                if (scale != 1 && isPointAtBox(centerX, centerY, radius, x, y, scale, visibleBorder))
                {
                    imageData.data[index++] = 255 - type.color[0];
                    imageData.data[index++] = 255 - type.color[1];
                    imageData.data[index++] = 255 - type.color[2];
                    imageData.data[index++] = 255;
                }
                else
                {
                    imageData.data[index++] = type.color[0];
                    imageData.data[index++] = type.color[1];
                    imageData.data[index++] = type.color[2];
                    imageData.data[index++] = 255;
                }
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

function isPointAtBox(centerX, centerY, radius, x, y, scale, borderSize)
{
    var xs = x*scale;
    var ys = y*scale;
    var bx1 = centerX+radius*scale;
    var by1 = centerY+radius*scale;
    var bx2 = centerX-radius*scale;
    var by2 = centerY-radius*scale;
    if (isAround(xs, bx1, borderSize) || isAround(ys, by1, borderSize) || isAround(-xs, bx2, borderSize) || isAround(-ys, by2, borderSize)) 
    {
        if (xs <= bx1+borderSize && ys <= by1+borderSize && -xs <= bx2+borderSize && -ys <= by2+borderSize)
        {
            return true;
        }
        else
        {
            return false;
        }
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