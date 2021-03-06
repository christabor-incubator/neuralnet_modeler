$(document).ready(function(){
    // Get a bunch of random colors to start with. Likelihood of going over 100 layers is very low.
    var color_seed = d3.map(d3.range(100), getRandomColor).keys();
    var num_layers = 1;
    // Create the input graph
    var g = new dagreD3.graphlib.Graph({directed: true, compound: true, multigraph: false});
    var padding = 10;
    // Create the renderer
    var render = new dagreD3.render();
    var network = [];
    var layers = $('.layers');
    var active_neuron_type = 'perceptron';
    var direction_toggle = $('#rankdir');
    var recurrent_toggle = $('#recurrent');
    var neuron_type_toggle = $('#neuron-type');

    function uid() {
        function r() {
            return ~~(Math.random() * 10000);
        }
        return r() + '-' + r() + '-' + r();
    }

    function getRandomColor() {
        function rgb() {
            return ~~(Math.random() * 255);
        }
        return ['rgba(', rgb(), ',', rgb(), ',', rgb(), ',', '1)'].join('');
    }

    // Set up an SVG group so that we can translate the final graph.
    var svg = d3.select('svg');
    var svg_group = svg.append('g');

    function clearGraph() {
        g.nodes().forEach(function(id){
            g.removeNode(id);
        });
    }

    function getSum(index) {
        // Return sum of inputs for a layer
        var weights = $.map(network[index].factors, function(factor, k){
            return factor.is_active ? factor.weight : 0;
        });
        return d3.sum(weights);
    }

    function getLayerType(index, max) {
        if(index === 0) {return '(Input layer)';}
        if(index === max - 1) {return '(Output layer)';}
        return '(Hidden layer)';
    }

    function isHiddenLayer(index, max) {
        return getLayerType(index, max) === '(Hidden layer)';
    }

    function isInputLayer(index, max) {
        return getLayerType(index, max) === '(Input layer)';
    }

    function isOutputLayer(index, max) {
        return getLayerType(index, max) === '(Output layer)';
    }

    function reRender() {
        var wont_fire_html = '<span class="label label-danger">Won\'t fire <span class="fa fa-times"></span></span>';
        var will_fire_html = '<span class="label label-success">Will fire <span class="fa fa-check"></span></span>';
        var is_recurrent = recurrent_toggle.prop('checked');
        clearGraph();
        g.setGraph({
             rankdir: direction_toggle.val() === 'horizontal' ? 'LR' : 'TB',
        });
        var num_layers = network.length;
        var curr_layer_index = 0;
        $.each(network, function(layer_k, layer){
            // Set layer label (group)
            var sum = getSum(curr_layer_index);
            var will_fire = sum >= layer.threshold;
            var is_hidden = isHiddenLayer(curr_layer_index, num_layers);
            g.setNode(layer.id, {
                label: getLayerType(curr_layer_index, num_layers) + ' ' + layer.name + ' / Sum = ' + sum + ' / Threshold = ' + layer.threshold + ' Will fire? ' + (will_fire ? 'Yes': 'No'),
                clusterLabelPos: 'bottom',
                style: 'fill: #F7F7F7; stroke-width: 4px; stroke: ' + layer.color
            });
            layers.find('.layer').eq(curr_layer_index).find('.firingstatus').html(will_fire ? will_fire_html : wont_fire_html);
            curr_layer_index += 1;
            $.each(layer.factors, function(factors_k, factor){
                // Set layer node
                var opts = {
                    label: factor.label,
                    class: factor.is_active ? 'active' : 'inactive',
                    shape: 'circle',
                    width: 50,
                    height: 25
                };
                if(is_recurrent && is_hidden) {
                    g.setEdge(factor.id, factor.id);
                } else {
                    g.removeEdge(factor.id, factor.id);
                }
                g.setNode(factor.id, opts);
                // Add to group for visual grouping
                g.setParent(factor.id, layer.id);
                // Can't link to prev or last if starting or ending...
                if(layer_k === 0 || layer_k === num_layers) {return;}
                // Link previous layers' nodes to all of this layers' nodes.
                var prev_layer = network[layer_k - 1];
                $.each(prev_layer.factors, function(k, prev_factor){
                    g.setEdge(prev_factor.id, factor.id, {
                        lineInterpolate: 'basis',
                        arrowhead: 'vee',
                        label: prev_factor.weight
                    });
                });
                // Set edges to inactive/active
                setEdges(factor.id, factor.is_active ? 'active' : 'inactive');
            });
        });

        // Run the renderer. This is what draws the final graph.
        render(svg_group, g);

        svg.attr('viewBox', '0 0 ' + g.graph().width + ' ' + g.graph().height);
    }

    function isRoot(node_id) {
        return g.inEdges(node_id).length === 0;
    }

    function isLeaf(node_id) {
        return g.outEdges(node_id).length === 0;
    }

    function setEdges(node_id, state) {
        // Set ingoing / outgoing edges to this node inactive
        // if it's inactive, otherwise, active.
        var edges = g.nodeEdges(node_id);
        edges.forEach(function(edge, k){
            var edgedata = g.edge(edge.v, edge.w);
            g.setEdge(edge.v, edge.w, $.extend(edgedata, {class: state}));
        });
    }

    function renderAndUpdateEvent(e) {
        updateNetwork();
        reRender();
    }

    direction_toggle.on('change', renderAndUpdateEvent);
    recurrent_toggle.on('click', renderAndUpdateEvent);
    layers.on('click', '.node-active', renderAndUpdateEvent);

    layers.on('keypress keyup keydown', '[contenteditable]', function(e){
        e.stopImmediatePropagation();
        renderAndUpdateEvent(e);
    });

    function getWeightForType(el) {
        // Ensure the weight values are appropriate for
        // the neuron type (sigmoid, perceptron, etc)
        var weight = null;
        if(el.data().editType === 'weight') {
            var weight =el.text();
            if(active_neuron_type === 'sigmoid') {
                weight = parseFloat(weight, 10);
            } else {
                weight = parseInt(weight, 10);
            }
        }
        return weight;
    }

    layers.on('click', '#add-factor', function(e){
        e.preventDefault();
        var default_weight = active_neuron_type == 'perceptron' ? '0' : '0.0';
        var row = ['<tr><td contenteditable="true" data-edit-type="label">Varname</td>',
                   '<td contenteditable="true" data-edit-type="weight">' + default_weight + '</td>',
                   '<td><input type="checkbox" checked="checked" class="node-active" /></td>',
                   '<td><a href="#" class="remove-factor btn btn-danger btn-xs">',
                   '<span class="fa fa-times"></span></a></td></tr>'
                   ].join('');
        $(this).parent().find('table').find('tbody').append(row);
        updateNetwork();
        reRender();
    });

    layers.on('click', '.remove-factor', function(){
        $(this).parent().parent().remove();
        updateNetwork();
        reRender();
    });

    neuron_type_toggle.on('change', function(e){
        active_neuron_type = $(this).val();
    });

    $('#add-layer').on('click', function(e){
        e.preventDefault();
        var layer = $('.layer').last().clone();
        var color_label = color_seed.pop();
        layer.find('tbody').empty();
        layer.find('.layername').text('Layer ' + $('.layer').length + 1);
        layer.css('border-top', '10px solid ' + color_label)
            .attr('data-color', color_label);
        $('.layers').append(layer);
        updateNetwork();
        reRender();
    });

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')';
    }

    function updateNetwork() {
        // Reset value each time
        network = [];
        $('.layer').each(function(k, layer){
            var layer = $(layer);
            var layer_factors = [];
            $(layer).find('table tbody > tr').each(function(i, factor){
                layer_factors.push({
                    label: $(factor).find('td:first').text(),
                    weight: $(factor).find('td').eq(1).text(),
                    is_active: $(factor).find('td').eq(2).find('input').is(':checked'),
                    id: uid()
                })
            });
            network.push({
                name: layer.find('.layername').text(),
                factors: layer_factors,
                color: layer.data().color,
                threshold: parseInt(layer.find('.threshold').text(), 10),
                id: uid()
            });
        });
        $('#debug').find('code').text(JSON.stringify(network, null, 4));
    }

    updateNetwork();
    reRender();
});
