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

    buildDescription()
    {
        return 'Scale: ' + this.scale + '; Area Scale: ' + this.areaScale + '; Priority: ' + this.priority;
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

function rgbToHex(r, g, b) 
{
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function onTooltip(div)
{
    div.onmousemove = function(e) 
    {
        var x=e.pageX+20;
        var y=e.pageY-2;
        var tooltip = document.getElementById('tooltip');
        tooltip.style.top = y+'px';
        tooltip.style.left = x+'px';
        var rect = document.getElementById('canvas').getBoundingClientRect();
        var borderX = parseInt(getComputedStyle(document.getElementById('canvas'), null).getPropertyValue('border-left-width'));
        var borderY = parseInt(getComputedStyle(document.getElementById('canvas'), null).getPropertyValue('border-top-width'));
        var centerX = Math.floor(width / 2.0);
        var centerY = Math.floor(height / 2.0);
        var sampleX = (e.pageX - rect.left - window.scrollX - centerX - borderX) * 16 * scale;
        var sampleY = (e.pageY - rect.top - window.scrollY - centerY - borderY) * 16 * scale;
        //document.getElementById('debug').innerHTML = (e.pageY - rect.top - window.scrollY - centerY - borderY);
        var type = getTypeAt(sampleX, sampleY);
        if (type != null)
        {
            tooltip.innerHTML = type.name;
            tooltip.style.display = 'block';
           // tooltip.style.color = rgbToHex(255 - type.color[0], 255 - type.color[1], 255 - type.color[2]);
        }
    };
    div.onmouseout = function() {
        document.getElementById('tooltip').style.display='none';
    };
    window.onscroll = updatePos(div);
}

const types = [
    new Type('Empty', [0, 0, 0], 1000.0, 0.3, 1.0),
    new Type('Cumulus', [255, 0, 0], 2000.0, 0.2, 1.0),
    new Type('Stratocumulus', [0, 255, 0], 5000.0, 0.5, 1.0),
    new Type('test4', [255, 255, 255], 10000.0, 0.0, 10.0)
];

for (var i = 0; i < types.length; i++)
{
    var type = types[i];
    var r = type.color[0];
    var g = type.color[1];
    var b = type.color[2];

    const div = document.createElement('div');
    div.setAttribute('id', type.name);
    div.setAttribute('class', 'type');
    document.getElementById('types').appendChild(div);

    const title = document.createElement('h3');
    title.innerHTML = type.name;
    var textColor;
    if (r*0.299 + g*0.587 + b*0.114 > 186) {
        textColor = '#000000';
    }
    else {
        textColor = '#ffffff';
    }
    title.setAttribute('style', 'border: 5px solid white; background-color: ' + rgbToHex(r, g, b) + '; color: ' + textColor + ';');
    div.appendChild(title);

    var description = document.createElement('p');
    description.innerHTML = type.buildDescription();
    description.setAttribute('style', 'margin-top: 0px; padding: 0px;');
    div.appendChild(description);
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
        if (xs <= bx1+borderSize && ys <= by1+borderSize && -xs <= bx2+borderSize && -ys <= by2+borderSize) {
            return true;
        }
        else {
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