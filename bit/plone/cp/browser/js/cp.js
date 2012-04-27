
$(document).ready(function() { 
    var index;
    var fields;

    var load_tables = function() {
	var table;
	$.ajax({
	    url: "cp_tables",
	    dataType: 'json',
	    success: function(data) {
		var i, item, form, options, option;
		options = "";   
		index = data['index'];
		fields = data['fields'];
		for (option in data) {
		    options += "<option value='" + option + "'>" + data[option]['title'] + "</option>"
		}
		$('#controls-table form select.tables').html(options);
	    }
	});
    }
    
    load_tables();

    var load_controls = function() {
	var table;
	table = $('#controls-table form select.tables option:selected').val();
	$.ajax({
	    url: "cp_fields",
	    dataType: 'json',
	    data: {table: table},
	    success: function(data) {
		var i, item, form, options;
		form = $('#controls-params form');	
		options = "";   
		index = data['index'];
		fields = data['fields'];
		for (i = 0; i < data['index'].length; i++) {
		    options += "<option value='" + data['index'][i] + "'>" + data['fields'][data['index'][i]]['title'] + "</option>"
		}
		form.find('select.sort').html(options);
		headers = "<th>Index</th>";
		for (i = 0; i < data['index'].length; i++) {
		    headers += "<th>" + data['fields'][data['index'][i]]['title'] + "</th>"
		}
		$('#control-panel tr.table-headers').html(headers);
		$('#controls-params').show('slow');
	    }
	});
    }

    var load_table = function() {
	var table, form, limit, search, page, sort, reverse;
	table = $('#controls-table form select.tables option:selected').val();
	form = $('#controls-params form');
	limit = form.find('input.limit')[0].value;
	search = form.find('input.search')[0].value;
	page = form.find('input.page')[0].value;
	sort = form.find('select.sort option:selected')[0].value;
	reverse = (form.find('input.reverse')[0].checked) ? 1 : 0;
	$.ajax({
	    url: "cp_data",
	    dataType: 'json',
	    data: {
		limit: limit,
		page: page,
		search: search,
		sort: sort,
		reverse: reverse,
		table: table,
	    },
	    success: function(data) {
		var i, item, items, form, options, checked, href, text, list, list_items, i2;
		items = [];
		for (item in data) {
		    data[item]['item'] = item;
		    items[data[item]['index']] = data[item];
		}
		rows = '';
		for (item in items) {
		    row = '<tr>';
		    cells = "<td>" + items[item]['index'] + "</td>";
		    for (i = 0; i < index.length; i++) {
			if (fields[index[i]].type === 'checkbox') {			    	
			    if (items[item][index[i]]) {
				checked = 'checked';
			    } else {
				checked = '';
			    }
			    cells += "<td><input type='checkbox' " + checked + " /></td>"			    
			} else if (fields[index[i]].type === 'link') {	
			    link = items[item][index[i]]
			    href = link[0]
			    text = link[1]
			    cells += "<td><a  href='" + href + "'>" + text + "</a></td>"			    			    
			} else if (fields[index[i]].type === 'list') {	
			    list_items = items[item][index[i]]
			    list = ''
			    for (i2 = 0; i2 < list_items.length; i2++) {
				list += '<li>' + list_items[i2] + '</li>'
			    }
			    cells += "<td><ul>" + list + "</ul></td>"		    			    
			} else {
			    cells += "<td>" + items[item][index[i]] + "</td>"
			}
		    }
		    row += cells + '</tr>';
		    rows += row;
		} 
		$('#control-panel table tbody').html(rows);		
		$('#control-panel').show('slow');
	    }
	});
    }
    
    var itemOverlay = {
	subtype: 'ajax',
	noform: 'close',
	formselector: 'form',
	filter: '#content>*',
	config: {
	    onBeforeClose: function(e) {
		load_table();
		return true;
	    }
	}
    };
    
    $('.bns-member-report-next').click(function(evt) {
	evt.preventDefault();
	var form = $('form#bns-member-report-controls');
	var page = form.find('input.page')[0]
	var current = parseInt(page.value);
	$(page).val(current + 1);
	return load_table();
    })


    $('#control-panel td a').live('click mousedown', function(evt) {
	evt.preventDefault();
	return $(this).prepOverlay(itemOverlay)
    })
    
    $('#controls-table form input:submit').click(function(evt) {
	evt.preventDefault();
	return load_controls();
    })
  
    $('#controls-params input:submit').click(function(evt) {
	evt.preventDefault();
	return load_table();
    })

})
