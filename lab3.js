const indices = ["surf", "beach", "game", "study"];
function input(t) { // verify the input sequence (and protect)
    const values = t.value.trim().split(",").filter((value) => indices.includes(value));
    if (values.length > 0) {
        viterbi(values, states, start_p, trans_p, emit_p);
    }
}

// The magic happens here
function viterbi(obs, states, start_p, trans_p, emit_p) {

    var V = [{}]; // initiate the array where we'll save the values for the Viterbi Method
    var F = [{}]; // initiate the array where we'll save the values for the Forward Method
    states.forEach(function (st) { // calculate the probability for each state (first column)
        V[0][st] = { "prob": Math.log(start_p['rainy']) + Math.log(trans_p['rainy'][st]) + Math.log(emit_p[st][obs[0]]), "prev": "rainy" };
    });
    // V[0] = [{'sunny': {prob: X, prev: null}, 'windy': {prob: X, prev: null}, 'rainy': {prob: X, prev: null}, } ]

    // Run Viterbi when t > 0
    for (var t = 1; t < obs.length; t++) {
        V.push({});
        states.forEach(function (st) { // for each state (1, 2 or 3)
            prev_st_selected = states[0]; // current maximum previous state
            max_tr_prob = V[t - 1][states[0]]["prob"] + Math.log(trans_p[states[0]][st]); // calculate the probability if the previous state is the first one
            states.slice(1).forEach(function (prev_st) { // for each of the remaining states exclude the first one, since the probability was already computed
                tr_prob = V[t - 1][prev_st]["prob"] + Math.log(trans_p[prev_st][st]); // calculate the probability for each previous state
                if (tr_prob > max_tr_prob) { // compare to select the maximum of it
                    max_tr_prob = tr_prob;
                    prev_st_selected = prev_st; // update the maximum previous state
                }
            })
            max_prob = max_tr_prob + Math.log(emit_p[st][obs[t]]); // multiply the maximum probability of the previous observation with the emission probability
            V[t][st] = { "prob": max_prob, "prev": prev_st_selected }; // append to the V matrix
        })
    }


    // The highest probability
    var max_prob = - Infinity;
    var min_prob = 0, previous;
    states.forEach((state) => {
        var prob = Math.log(trans_p[state]['sunny']) + V[V.length - 1][state]['prob'];
        if (prob > max_prob) {
            max_prob = prob;
            previous = state;
        }
        if (prob < min_prob && prob != -Infinity) { // min probability - used for the table (pormenores)
            min_prob = prob;
        }
    });

    var opt = []; // optimal path
    opt.unshift(previous) // prepend the last state

    // Follow the backtrack till the first observation
    for (var t = V.length - 1; t >= 1; t--) {
        previous = V[t][previous]['prev']
        opt.unshift(previous) // prepend the state
    }

    //print 'The steps of states are ' + ' '.join(opt) + ' with highest probability of %s' % max_prob
    createTable(obs, states, V, opt, min_prob); // doesn't matter
}


function createTable(obs, states, V, opt, min_prob) {
    var val, table = '<table align="center">';
    var opacity = ['FC', 'FA', 'F7', 'F5', 'F2', 'F0', 'ED', 'EB', 'E8', 'E6', 'E3', 'E0', 'DE', 'DB', 'D9', 'D6', 'D4', 'D1', 'CF', 'CC', 'C9', 'C7', 'C4', 'C2', 'BF', 'BD', 'BA', 'B8', 'B5', 'B3', 'B0', 'AD', 'AB', 'A8', 'A6', 'A3', 'A1', '9E', '9C', '99', '96', '94', '91', '8F', '8C', '8A', '87', '85', '82', '80', '7D', '7A', '78', '75', '73', '70', '6E', '6B', '69', '66', '63', '61', '5E', '5C', '59', '57', '54', '52', '4F', '4D', '4A', '47', '45', '42', '40', '3D', '3B', '38', '36', '33', '30', '2E', '2B', '29', '26', '24', '21', '1F', '1C', '1A', '17', '14', '12', '0F', '0D', '0A', '08', '05', '03', '00']


    table += '<tr><td></td>';
    for (var j = 0; j < obs.length; j++) {
        table += '<td align="center">' + obs[j] + '</td>';
    }
    table += '</tr>';

    for (var s = 0; s < states.length; s++) {

        table += '<tr>';
        for (var o = 0; o < obs.length; o++) {
            if (o == 0) {
                table += '<td align="center">' + states[s] + '</td>';
                // let val = start_p[states[s]];
                // if (val == 1) {
                //     table += '<td align="center" class="prob black path" bgcolor="#000" style="color:#FFF">' + val + '</td>';
                // } else {
                //     table += '<td align="center" class="prob black" bgcolor="#dedede">' + val + '</td>';
                // }
            }

            var cla = "";
            if (s == states.findIndex(function (state) { return state == opt[o]; })) {
                cla = "path";
            }

            val = start_p[states[s]]
            val = V[o][states[s]]['prob'];
            if (val == -Infinity) {
                table += '<td align="center" class="prob black ' + cla + '" bgcolor="#FFFFFF">' + 0 + '</td>';
            } else {
                var v = opacity[Math.round((opacity.length - 1) - (opacity.length - 1) * val / min_prob)];
                var v2 = Math.round(val / min_prob);
                var c2;
                if (v2 > 0.5) {
                    c2 = "#000000";
                } else {
                    c2 = "#FFFFFF";
                }
                var c = "#" + v + v + v;
                // table += '<td align="center" class="prob ' + cla + '" bgcolor="' + c + '" style="color:' + c2 + '">' + Math.pow(10, val).toExponential(2) + '</td>';
                if (val == 0 || val == 1) {
                    if (val > 0.5) {
                        c2 = "#FFFFFF";
                    } else {
                        c2 = "#000000";
                    }
                    var v = opacity[Math.round((opacity.length - 1) - (opacity.length - 1) * (1 - val) / min_prob)];
                    var c = "#" + v + v + v;
                    table += '<td align="center" class="prob ' + cla + '" bgcolor="' + c + '" style="color:' + c2 + '">' + val + '</td>';
                } else {

                    table += '<td align="center" class="prob ' + cla + '" bgcolor="' + c + '" style="color:' + c2 + '">' + Math.exp(val).toExponential(2) + '</td>';
                }
            }

        }
        // if (s == 0) {
        //     table += '<td align="center" class="prob ' + cla + '" bgcolor="' + c + '" style="color:' + c2 + '">' + Math.exp(val).toExponential(2) + '</td>';
        // } else {
        //     var v2 = Math.round(0 / min_prob);
        //     var c2;
        //     if (v2 > 0.5) {
        //         c2 = "#000000";
        //     } else {
        //         c2 = "#FFFFFF";
        //     }
        //     var v = opacity[Math.round((opacity.length - 1) - (opacity.length - 1) * 0 / min_prob)];
        //     var c = "#" + v + v + v;
        //     table += '<td align="center" class="prob ' + cla + '" bgcolor="#dedede" style="color:#000">' + 0 + '</td>';
        // }
        // table += '</tr>';
    }

    table += '<tr><td><b>Path &pi;*</b></td>';
    // table += '<td align="center" class="pi" bgcolor="#BFE3B4">rainy</td>';
    for (var j = 0; j < opt.length; j++) {
        table += '<td align="center" class="pi" bgcolor="#BFE3B4">' + opt[j] + '</td>';
    }
    // table += '<td align="center" class="pi" bgcolor="#BFE3B4">sunny</td>';
    table += '</tr>';

    table += '<tr><td>Day</td>';
    day = 8;
    for (var j = 0; j < opt.length; j++) {
        table += '<td align="center">' + day++ + '</td>';
    }
    table += '</tr>';

    table += '</table>';
    $('.table').html(table); // add the result table to the HTML file
}



var obs = ['game', 'surf', 'beach', 'study', 'beach', 'study', 'beach'];
var states = ['sunny', 'windy', 'rainy'];
var start_p = { 'sunny': 0, 'windy': 0, 'rainy': 1 };
var stop_p = { 'sunny': 1, 'windy': 0, 'rainy': 0 };
var trans_p = {
    'sunny': { 'sunny': 0.6, 'windy': 0.3, 'rainy': 0.1 },
    'windy': { 'sunny': 0.3, 'windy': 0.5, 'rainy': 0.2 },
    'rainy': { 'sunny': 0.2, 'windy': 0.3, 'rainy': 0.5 }
};
var emit_p = {
    'sunny': { 'surf': 0.4, 'beach': 0.4, 'game': 0.1, 'study': 0.1 },
    'windy': { 'surf': 0.5, 'beach': 0.1, 'game': 0.1, 'study': 0.3 },
    'rainy': { 'surf': 0.1, 'beach': 0.1, 'game': 0.3, 'study': 0.5 },
};

//viterbi('CATGCGGGTTATAAC')
viterbi(obs, states, start_p, trans_p, emit_p)


