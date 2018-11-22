// returns a gaussian random function with the given mean and stdev.
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function () {
        var y1;
        if (use_last) {
            y1 = y2;
            use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while (w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w)) / w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        var retval = mean + stdev * y1;
        if (retval > 0)
            return retval;
        return -retval;
    }
}

String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

let currentSeed = Math.round(Math.random() * 360);
const avgStep = 120;
const calc = gaussian(avgStep, avgStep / 4);

export default function (id = '') {
    let hue;
    let str = String(id);
    if (!str) {
        currentSeed += Math.round(calc());
        currentSeed %= 360;
        hue = currentSeed;
    } else {
        if (/#[0-9]{6}/i.test(str)) {
            return str;
        }
        hue = str.hashCode() % 360;
    }

    return 'hsl(' + hue + ', 58%, 57%)';
};