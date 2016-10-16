$(document).ready(function(){
    var num_layers = 1;
    // Create the input graph
    var g = new dagreD3.graphlib.Graph({directed: true, compound: true, multigraph: false}).setGraph({});
    var padding = 10;
    // Create the renderer
    var render = new dagreD3.render();
    var network = [];

    // var zoom = d3.behavior.zoom().on("zoom", function() {
    //     svg_group.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
    // });

    function uid() {
        function r() {
            return ~~(Math.random() * 10000);
        }
        return r() + '-' + r() + '-' + r();
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

    function reRender() {
        clearGraph();
        var num_layers = network.length;
        var curr_layer_index = 0;
        $.each(network, function(layer_k, layer){
            // Set layer label (group)
            var sum = getSum(curr_layer_index);
            g.setNode(layer.id, {
                label: layer.name + ' / Sum = ' + sum + ' / Threshold = ' + layer.threshold + ' Will fire? ' + (sum >= layer.threshold ? 'Yes': 'No'),
                clusterLabelPos: 'bottom',
                style: 'fill: #D0FAE4'
            });
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
                g.setNode(factor.id, opts);
                // Add to group for visual grouping
                g.setParent(factor.id, layer.id);
                // Can't link to prev or last if starting or ending...
                if(layer_k === 0 || layer_k === num_layers) {return;}
                // Link previous layers' nodes to all of this layers' nodes.
                var prev_layer = network[layer_k - 1];
                $.each(prev_layer.factors, function(k, prev_factor){
                    g.setEdge(prev_factor.id, factor.id, {lineInterpolate: 'basis', arrowhead: 'vee', label: prev_factor.weight});
                });
            });
        });

        // Run the renderer. This is what draws the final graph.
        render(svg_group, g);

        // Center the graph
        // var x_center_offset = (svg_width - g.graph().width) / 2;
        // svg_group.attr('transform', translate(svg_width / 2, svg_height / 2));
        // svg_group.attr('transform', 'translate(' + x_center_offset + ', 20)');
        // svg.attr('height', g.graph().height + 40);
        svg.attr('viewBox', '0 0 ' + g.graph().width + ' ' + g.graph().height);

        // svg.call(zoom);
        // var initialScale = 0.75;
        // zoom.translate([(svg.attr("width") - g.graph().width * initialScale) / 2, 20])
        //     .scale(initialScale)
        //     .event(svg);
        // svg.attr('height', g.graph().height * initialScale + 40);
    }

    $('.layers').on('click', '.node-active', function(e){
        updateNetwork();
        reRender();
    });

    $('.layers').on('keypress', '[contenteditable]', function(e){
        updateNetwork();
        reRender();
    });

    function translate(x, y) {
        return 'translate(' + x + ',' + y + ')';
    }

    $('.layers').on('click', '#add-factor', function(e){
        e.preventDefault();
        var row = ['<tr><td contenteditable="true">Varname</td>',
                   '<td contenteditable="true">0</td>',
                   '<td><input type="checkbox" checked="checked" class="node-active" /></td>',
                   '<td><a href="#" class="remove-factor btn btn-danger btn-xs">',
                   '<span class="fa fa-times"></span></a></td></tr>'
                   ].join('');
        $(this).parent().find('table').find('tbody').append(row);
        updateNetwork();
        reRender();
    });

    $('.layers').on('click', '.remove-factor', function(){
        $(this).parent().parent().remove();
        updateNetwork();
        reRender();
    });

    $('#add-layer').on('click', function(e){
        e.preventDefault();
        var layer = $('.layer').last().clone();
        num_layers = $('.layer').length + 1;
        layer.find('tbody').empty();
        layer.find('.layername').text('Layer ' + num_layers);
        $('.layers').append(layer);
        updateNetwork();
        reRender();
    });

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
                threshold: parseInt(layer.find('.threshold').text(), 10),
                id: uid()
            });
        });
        $('#debug').find('code').text(JSON.stringify(network, null, 4));
    }

    updateNetwork();
    reRender();
});
