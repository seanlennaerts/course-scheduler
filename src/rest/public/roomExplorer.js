$(function () {
    var buildQuery = {"GET":["rooms_shortname","rooms_number","rooms_address","rooms_seats","rooms_type","rooms_furniture"],
        "WHERE":{},
        "ORDER":{"dir":"UP","keys":["rooms_shortname","rooms_number"]},
        "AS":"TABLE"
    };
    var filtersUsed = {
        "shortname": false,
        "number": false,
        "type": false,
        "furniture": false,
        "seats": false,
        "location": false
    };
    var distanceFilter = [];
    var roomsSelected = [];

    $(document).ready(function() {
        $("#size-range").slider({});
        $("#distance-range").slider({});
        $("#order").bootstrapSwitch("size", "small").bootstrapSwitch("state", true, true).bootstrapSwitch("onText", "UP").bootstrapSwitch("offText", "DOWN");
        query(JSON.stringify(buildQuery));
        updateDebugQuery();
    });

    $(document).on("change", "#buildings-scrollable", function() {
        var buildingsClear = $("#buildings-bc");
        var shortname = $(this).val();
        if (shortname) {
            buildingsClear.show();
            handleDropDowns("shortname", shortname);
            filtersUsed.shortname = false; //weird hack so that it doesn't update shortname temporarilly
            query(JSON.stringify(buildQuery));
            filtersUsed.shortname = true;
        } else {
            buildingsClear.hide();
            clear("shortname");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#numbers-scrollable", function() {
        var numbersClear = $("#numbers-bc");
        var number = $(this).val();
        if (number) {
            numbersClear.show();
            handleDropDowns("number", number);
            filtersUsed.number = false;
            query(JSON.stringify(buildQuery));
            filtersUsed.number = true;
        } else {
            numbersClear.hide();
            clear("number");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#types-scrollable", function() {
        var typesClear = $("#types-bc");
        var type = $(this).val();
        if (type) {
            typesClear.show();
            handleDropDowns("type", type);
            filtersUsed.type = false;
            query(JSON.stringify(buildQuery));
            filtersUsed.type = true;
        } else {
            typesClear.hide();
            clear("type");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#furnitures-scrollable", function() {
        var furnituresClear = $("#furnitures-bc");
        var furniture = $(this).val();
        if (furniture) {
            furnituresClear.show();
            handleDropDowns("furniture", furniture);
            filtersUsed.furniture = false;
            query(JSON.stringify(buildQuery));
            filtersUsed.furniture = true;
        } else {
            furnituresClear.hide();
            clear("furniture");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#distance-scrollable", function() {
        var distanceClear = $("#distance-bc");
        var from = $(this).val();
        if (from) {
            distanceClear.show();
            $("#distance-range").slider("enable");
        }
    });

    $("#distance-range").on("slideStop", function (slideEvt) {
        var value = slideEvt.value;
        var distanceQuery = {shortname: $("#distance-scrollable").val(), range: value};
        try {
            $.ajax("/distance", {type:"POST", data: JSON.stringify(distanceQuery), contentType: "application/json", dataType: "json", success: function(data) {
                distanceFilter = data["shortnames"];
                query(JSON.stringify(buildQuery));
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }

    });

    $("#size-range").on("slideStop", function (slideEvt) {
        var values = slideEvt.value;
        var exists = false;
        if (!buildQuery.WHERE.AND) {
            buildQuery.WHERE = {"AND": []};
        }
        for (var i=0; i < buildQuery.WHERE.AND.length; i++) {
            if (Object.keys(buildQuery.WHERE.AND[i])[0] === "AND") {
                buildQuery.WHERE.AND[i].AND[0].GT.rooms_seats = values[0];
                buildQuery.WHERE.AND[i].AND[1].LT.rooms_seats = values[1];
                exists = true;
            }
        }
        if (!exists) {
            buildQuery.WHERE.AND.push({"AND":[{"GT": {"rooms_seats": values[0]}},{"LT": {"rooms_seats": values[1]}}]})
        }
        filtersUsed.seats = false;
        query(JSON.stringify(buildQuery));
        filtersUsed.seats = true;
        updateDebugQuery();
    });

    function getORArray(key) {
        var index = -1;
        var andArray = buildQuery.WHERE.AND;
        for (var i=0; i < andArray.length; i++) {
            if (andArray[i].OR) {
                var sampleORArray = andArray[i].OR[0].IS; //all ors in an AND have the same key so only need to check one
                if (Object.keys(sampleORArray)[0].split("_")[1] === key) {
                    index = i;
                }
            }
        }
        return index;
    }

    $("#buildings-bc").click(function () {
        $(this).hide();
        clear("shortname");
        $("#buildings-scrollable").selectpicker("val", "");
    });

    $("#numbers-bc").click(function () {
        $(this).hide();
        clear("number");
        $("#numbers-scrollable").selectpicker("val", "");

    });

    $("#types-bc").click(function () {
        $(this).hide();
        clear("type");
        $("#types-scrollable").selectpicker("val", "");
    });

    $("#furnitures-bc").click(function () {
        $(this).hide();
        clear("furniture");
        $("#furnitures-scrollable").selectpicker("val", "");
    });

    $("#distance-bc").click(function () {
        $(this).hide();
        $("#distance-scrollable").selectpicker("val", "");
        $("#distance-range").slider({
            "value": 0
        }).slider("refresh").slider("disable");
        distanceFilter = [];
        query(JSON.stringify(buildQuery));
    });

    function clear(key) {
        var index = getORArray(key);
        buildQuery.WHERE.AND = buildQuery.WHERE.AND.filter(function (andArray) {
            if (andArray.OR) {
                return Object.keys(andArray.OR[0].IS)[0].split("_")[1] != key;
            }
        });
        if (buildQuery.WHERE.AND.length === 0) {
            buildQuery.WHERE = {}
        }
        filtersUsed[key] = false;
        updateDebugQuery();
        query(JSON.stringify(buildQuery));

    }

    function handleDropDowns(key, array) {
        var objArray = [];
        for (var i = 0; i < array.length; i++) {
            var toPush = '{"IS": {"rooms_' + key + '":"' + array[i] + '"}}';
            objArray.push(JSON.parse(toPush));
        }
        objArray = {"OR": objArray};
        if (!buildQuery.WHERE.AND) {
            buildQuery.WHERE = {"AND": []};
        }
        var index = getORArray(key);
        if (index != -1) {
            //found existing or for dept
            buildQuery.WHERE.AND[index] = objArray; //exists so replace
        } else {
            buildQuery.WHERE.AND.push(objArray); //create new OR array
        }
    }

    function updateDebugQuery() {
        $("#debug-where")
            .empty()
            .append('<p>' + JSON.stringify(buildQuery["WHERE"]) + '</p>');
        $("#debug-order")
            .empty()
            .append('<p>' + JSON.stringify(buildQuery["ORDER"]) + '</p>');
    }

    function query(queryJson) {
        try {
            $.ajax("/query", {type:"POST", data: queryJson, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    if (distanceFilter.length > 0) {
                        data["result"] = data["result"].filter(function (obj) {
                            return distanceFilter.includes(obj["rooms_shortname"]);
                        })
                    }
                    generateTable(data["result"], "#render", "table table-hover table-condensed");

                    if (!filtersUsed.shortname){
                        var buildingScrollable = $("#buildings-scrollable");
                        var prevBuildingVal = buildingScrollable.val();
                        populateShortname(data["result"]);
                        buildingScrollable.selectpicker("val", prevBuildingVal);
                    }
                    if (!filtersUsed.number) {
                        var numberScrollable = $("#numbers-scrollable");
                        var prevNumberVal = numberScrollable.val();
                        populateNumber(data["result"]);
                        numberScrollable.selectpicker("val", prevNumberVal);
                    }
                    if (!filtersUsed.type) {
                        var typeScrollable = $("#types-scrollable");
                        var prevTypeVal = typeScrollable.val();
                        populateType(data["result"]);
                        typeScrollable.selectpicker("val", prevTypeVal);
                    }
                    if (!filtersUsed.furniture) {
                        var furnitureScrollable = $("#furnitures-scrollable");
                        var prevFurnitureVal = furnitureScrollable.val();
                        populateFurniture(data["result"]);
                        furnitureScrollable.selectpicker("val", prevFurnitureVal);
                    }
                    if (!filtersUsed.seats) {
                        populateSize(data["result"]);
                    }
                    if (!filtersUsed.location) {
                        populateDistance(data["result"]);
                        filtersUsed.location = true;
                    }
                    parseShortnames(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    }

    function populateShortname(data) {
        populateHelper(data, "rooms_shortname", $("#buildings-scrollable"));
    }

    function populateNumber(data) {
        populateHelper(data, "rooms_number", $("#numbers-scrollable"));
    }

    function populateType(data) {
        populateHelper(data, "rooms_type", $("#types-scrollable"));
    }

    function populateFurniture(data) {
        populateHelper(data, "rooms_furniture", $("#furnitures-scrollable"));
    }

    function populateDistance(data) {
        populateHelper(data, "rooms_shortname", $("#distance-scrollable"));
    }

    function populateSize(data) {
        var sizeSlider = $("#size-range");
        var min = data[0]["rooms_seats"];
        var max = data[0]["rooms_seats"];
        for (var i = 0; i < data.length; i++) {
            var size = data[i]["rooms_seats"];
            if (size < min) {
                min = size;
            }
            if (size > max) {
                max = size;
            }
        }
        sizeSlider.slider({
            "min": min - 1,
            "max": max + 1,
            "value": [min - 1, max + 1]
        });
        sizeSlider.slider("refresh");
    }

    function populateHelper(data, key, selector) {
        var tempArray = [];
        selector.empty();
        for (var i = 0; i < data.length; i++) {
            var temp = data[i][key];
            if (!tempArray.includes(temp) && temp && temp != "") {
                tempArray.push(temp);
                selector.append('<option>' + temp + '</option>');
            }
        }
        // tempArray.sort();
        // for (var j = 0; j < tempArray.length; j++) {
        //     selector.append('<option>' + tempArray[j] + '</option>');
        // }
        selector.selectpicker('refresh');
    }

    function generateTable(data, id, tableClass) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title, //.split("_")[1]
                cl: title,
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select(id);
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").attr("class", tableClass);

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                try{
                    if (orderExists(d["head"])) {
                        return "selectedOrder";
                    }
                } catch(err){
                    //
                }
            })
            .attr("style", "padding-right: 20px")
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }

    //input for schedulizer
    // #render > table > tbody > tr:nth-child(1) > td.rooms_shortname
    $("#selectAll").click(function (){
        $("#render > table > tbody > tr").each(function () {
            var obj = {shortname: $(this).find(".rooms_shortname").html(), number: $(this).find(".rooms_number").html(), seats: +($(this).find(".rooms_seats").html())};
            var exists = false;
            for (var i=0; i < roomsSelected.length; i++) {
                if (JSON.stringify(roomsSelected[i]) === JSON.stringify(obj)) {
                    exists = true;
                }
            }
            if (!exists) {
                roomsSelected.push(obj);
            }
        });
        generateTable(roomsSelected, "#roomInput", "table");
        // $("#roomInput").children().unwrap();
        $("#roomInput").find("table").css("margin-bottom", "0px");
        $("#selectClear").show();
        $("#selectSchedulize").show();
        $(".okay").hide();
        $("#mapContainer").hide();
        $("#scrollableTable").show();
    });

    $("#selectClear").click(function () {
        roomsSelected = [];
        $("#selectClear").hide();
        $("#selectSchedulize").hide();
        $(".okay").hide();
        $("#scrollableTable").hide();
        $("#mapContainer").show();
    });

    $("#selectSchedulize").click(function () {
        try {
            $.ajax("/input", {type:"POST", data: JSON.stringify({id: "room", data: roomsSelected}), contentType: "application/json", dataType: "json", success: function(data) {
                $(".okay").fadeIn('fast').delay(1000).fadeOut('fast');
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    //ORDER
    $(document).on("click", "#render > table > thead > tr > th", function() {
        //$(this).html() //captures value of header clicked
        var key = $(this).html();
        if (!buildQuery.ORDER){
            var direction = "DOWN";
            if ($("#order").bootstrapSwitch("state")) {
                direction = "UP";
            }
            buildQuery["ORDER"] = {"dir": direction, "keys": []};
        }
        if (!orderExists(key)) {
            buildQuery.ORDER.keys.push(key);
            updateDebugQuery();
            query(JSON.stringify(buildQuery));
        } else {
            buildQuery.ORDER.keys = buildQuery.ORDER.keys.filter(function (k) {
                return k != key;
            });
            updateDebugQuery();
            if (buildQuery.ORDER.keys.length > 0) {
                query(JSON.stringify(buildQuery));
            } else {
                delete buildQuery.ORDER;
                query(JSON.stringify(buildQuery));
            }
        }
    });

    function orderExists(key) {
        return buildQuery.ORDER.keys.includes(key);
    }

    $("#order").on("switchChange.bootstrapSwitch", function (event, state) {
        if(state) {
            buildQuery.ORDER.dir = "UP";
            updateDebugQuery();
            query(JSON.stringify(buildQuery));
        } else {
            buildQuery.ORDER.dir = "DOWN";
            updateDebugQuery();
            query(JSON.stringify(buildQuery));
        }
    });

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }
});


