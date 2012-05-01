
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
		options = "<option value='---'>---</option>";
		index = data['index'];
		fields = data['fields'];
		for (option in data) {
		    options += "<option value='" + option + "'>" + data[option]['title'] + "</option>"
		}
		$('#controls-table form select.tables').html(options);
		$('#controls-table form select.tables').focus();
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
		options = ""
		index = data['index'];
		fields = data['fields'];
		for (i = 0; i < data['index'].length; i++) {
		    if (fields[index[i]].sort) {
			options += "<option value='" + data['index'][i] + "'>" + data['fields'][data['index'][i]]['title'] + "</option>"
		    }
		}
		form.find('select.sort').html(options);
		headers = '';
		for (i = 0; i < data['index'].length; i++) {
		    if (fields[index[i]].type === 'selection') {
			headers += "<th><input type='checkbox' class='select-all' /></th>"
		    } else {
			headers += "<th>" + data['fields'][data['index'][i]]['title'] + "</th>"
		    }
		}
		$('#control-panel tr.table-headers').html(headers);
		$('#controls-params').show('slow');
		$('#controls-params .search-params .search').focus();
		$.ajax({
		    url: "cp_buttons",
		    dataType: 'json',
		    data: {table: table},
		    success: function(buttons_data) {
			var i, item, form, options, buttons;
			form = $('#controls-params form');
			buttons = '<tr><td colspan="' + (data['index'].length + 2)  + '">'
			for (button in buttons_data) {
			    buttons += '<input type="submit" name="' + buttons_data[button] + '" value="' + button + '" />'
			}
			buttons += "</td></tr>"
			$('#control-panel table tfoot').html(buttons);
		    }
		});
	    }
	});
    }

    var status_message = function(message) {
	$('#controls-table .status-message').html(message);
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
	status_message('loading data....')
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
		css = 'even';
		for (item in items) {
		    row = '<tr class="cp-data-row ' + css + '">';
		    if (css === 'even') {
			css = 'odd'
		    } else {
			css = 'even'
		    }
		    cells = '';
		    for (i = 0; i < index.length; i++) {
			if (fields[index[i]].type === 'selection') {
			    cells += "<td><input type='checkbox' class='selector' name='paths:list' value='" + items[item][index[i]] + "' /></td>"
			} else if (fields[index[i]].type === 'checkbox') {
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
			    cells += "<td><a class='link-overlay' href='" + href + "'>" + text + "</a></td>"
			} else if (fields[index[i]].type === 'form-link') {
			    link = items[item][index[i]]
			    href = link[0]
			    text = link[1]
			    cells += "<td><a class='form-overlay' href='" + href + "'>" + text + "</a></td>"
			} else if (fields[index[i]].type === 'iframe') {
			    cells += "<td><iframe>" + items[item][index[i]] + "</iframe></td>"
			} else if (fields[index[i]].type === 'image') {
			    link = items[item][index[i]]
			    src = link[0]
			    href = link[1]
			    cells += "<td><a class='image-overlay' href='" + href + "'><img src='" + src + "' /></a></td>"
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
		status_message('')
	    }
	});
    }

    var formOverlay = {
	subtype: 'ajax',
	noform: 'close',
	formselector: 'form',
	filter: '#content>*',
	closeOnClick: false,
	afterpost: function(data, parent) {	    
	    parent.overlay().close();
	},
	config: {
	    onLoad: function(e) {
		if (kukit) {
		    kukit.engine.setupEvents(this.getOverlay());
		}
		return true;
	    },
	    onBeforeClose: function(e) {
		load_table();
		return true;
	    }
	}
    };

    var linkOverlay = {
	subtype: 'ajax',
	filter: '#content>*',
	closeOnClick: false,
	config: {
	    onLoad: function(e) {
		if (kukit) {
		    kukit.engine.setupEvents(this.getOverlay());
		}
		return true;
	    },
	    onBeforeClose: function(e) {
		load_table();
		return true;
	    }
	}
    };

    var imageOverlay = {
	subtype: 'image',
    };


    $('a.controls-next').click(function(evt) {
	evt.preventDefault();
	var form = $('form#controls-params');
	var page = form.find('input.page')[0]
	var current = parseInt(page.value);
	$(page).val(current + 1);
	return load_table();
    })

    $('#control-panel input.select-all').live('click mousedown', function(evt) {
	if ($(this).is(':checked')) {
	    $('#control-panel input.selector').each(function(){
		console.log('here');
		this.checked = true;
	    });
	} else {
	    $('#control-panel input.selector').each(function(){
		this.checked = false;
	    });
	}
    })

    $('#control-panel td a.image-overlay').live('click mousedown', function(evt) {
	evt.preventDefault();
	return $(this).prepOverlay(imageOverlay)
    })

    $('#control-panel td a.link-overlay').live('click mousedown', function(evt) {
	evt.preventDefault();
	return $(this).prepOverlay(linkOverlay)
    })

    $('#control-panel td a.form-overlay').live('click mousedown', function(evt) {
	evt.preventDefault();
	return $(this).prepOverlay(formOverlay)
    })

    $('#controls-table form select').change(function(evt) {
	evt.preventDefault();
	$(this).toggleClass('submitting', false);
	$('#control-panel').hide('slow');
	if ($(this).val() === '---') {
	    return $('#controls-params').hide('slow');
	} else {
	    return load_controls();
	}
    })

    $('#controls-params input:submit').click(function(evt) {
	evt.preventDefault();
	$(this).toggleClass('submitting', false);
	return load_table();
    })

})
