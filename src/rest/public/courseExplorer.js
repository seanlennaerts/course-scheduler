$(function () {
    var buildQuery = {"GET":["courses_dept","courses_id","courses_title","courses_avg","courses_instructor","courses_size","courses_pass","courses_fail"],
                        "WHERE":{},
                        "ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},
                        "AS":"TABLE"
                    };
    var filtersUsed = {
        "dept": false,
        "id": false,
        "instructor": false,
        "title": false,
        "size": false
    };
    var courseSelected = [];
    var grouped = false;

    $(document).ready(function() {
        // "IS": {"courses_dept": "cpsc"} for debugging

        $("#size-range").slider({});
        $("#groupAll").bootstrapSwitch("size", "small");
        $("#order").bootstrapSwitch("size", "small").bootstrapSwitch('state', true, true).bootstrapSwitch("onText", "UP").bootstrapSwitch("offText", "DOWN");
        query(JSON.stringify(buildQuery));
        updateDebugQuery();
    });

    $("#groupAll").on("switchChange.bootstrapSwitch", function (event, state) {
        if(state) {
            grouped = true;
            var currentWhere = JSON.stringify(buildQuery.WHERE);
            var groupAllQuery = '{"GET":["courses_dept","courses_id","courses_title","courseAverage","courseSize","coursePass","courseFail"],"WHERE":' + currentWhere +',"GROUP":["courses_dept","courses_id","courses_title"],"APPLY":[{"courseAverage":{"AVG":"courses_avg"}},{"courseSize":{"MAX":"courses_size"}},{"coursePass":{"MAX":"courses_pass"}},{"courseFail":{"MAX":"courses_fail"}}],"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"}';
            buildQuery = JSON.parse(groupAllQuery);
            $("#instructors-scrollable")
                .prop("disabled", true)
                .selectpicker('refresh');
            updateDebugQuery();
            var prev = filtersUsed.instructor;
            filtersUsed.instructor = true; //weird hack
            query(JSON.stringify(buildQuery));
            filtersUsed.instructor = prev;
        } else {
            grouped = false;
            var groupWhere = JSON.stringify(buildQuery.WHERE);
            var noGroupQuery = '{"GET":["courses_dept","courses_id","courses_title","courses_avg","courses_instructor","courses_size","courses_pass","courses_fail"],"WHERE":' + groupWhere + ',"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"}';
            buildQuery = JSON.parse(noGroupQuery);
            $("#instructors-scrollable")
                .prop("disabled", false)
                .selectpicker('refresh');
            var prev2 = filtersUsed.instructor;
            filtersUsed.instructor = true; //weird hack
            query(JSON.stringify(buildQuery));
            filtersUsed.instructor = prev2;
        }
    });

    $(document).on("change", "#departments-scrollable", function() {
        var departmentsClear = $("#departments-bc");
        var dept = $(this).val();
        if (dept) {
            departmentsClear.show();
            handleDropDowns("dept", dept);
            filtersUsed.dept = false; //weird hack so that it doesn't update dept temporarilly
            query(JSON.stringify(buildQuery));
            filtersUsed.dept = true;
        } else {
            departmentsClear.hide();
            clear("dept");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#sections-scrollable", function() {
        var sectionsClear = $("#sections-bc");
        var id = $(this).val();
        if (id) {
            sectionsClear.show();
            handleDropDowns("id", id);
            filtersUsed.id = false;
            query(JSON.stringify(buildQuery));
            filtersUsed.id = true;
        } else {
            sectionsClear.hide();
            clear("id");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#instructors-scrollable", function() {
        var instructorsClear = $("#instructors-bc");
        var instructor = $(this).val();
        if (instructor) {
            instructorsClear.show();
            handleDropDowns("instructor", instructor);
            filtersUsed.instructor = false;
            query(JSON.stringify(buildQuery));
            filtersUsed.instructor = true;
        } else {
            instructorsClear.hide();
            clear("instructor");
        }
        updateDebugQuery();
    });

    $(document).on("change", "#titles-scrollable", function() {
        var titlesClear = $("#titles-bc");
        var title = $(this).val();
        if (title) {
            titlesClear.show();
            handleDropDowns("title", title);
            filtersUsed.title = false;
            query(JSON.stringify(buildQuery));
            filtersUsed.title = true;
        } else {
            titlesClear.hide();
            clear("title");
        }
        updateDebugQuery();
    });

    $("#size-range").on("slideStop", function (slideEvt) {
        var values = slideEvt.value;
        var exists = false;
        if (!buildQuery.WHERE.AND) {
            buildQuery.WHERE = {"AND": []};
        }
        for (var i=0; i < buildQuery.WHERE.AND.length; i++) {
            if (Object.keys(buildQuery.WHERE.AND[i])[0] === "AND") {
                buildQuery.WHERE.AND[i].AND[0].GT.courses_size = values[0];
                buildQuery.WHERE.AND[i].AND[1].LT.courses_size = values[1];
                exists = true;
            }
        }
        if (!exists) {
            buildQuery.WHERE.AND.push({"AND":[{"GT": {"courses_size": values[0]}},{"LT": {"courses_size": values[1]}}]})
        }
        filtersUsed.size = false;
        query(JSON.stringify(buildQuery));
        filtersUsed.size = true;
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

    $("#departments-bc").click(function () {
        $(this).hide();
        clear("dept");
        $("#departments-scrollable").selectpicker("val", "");
    });

    $("#sections-bc").click(function () {
        $(this).hide();
        clear("id");
        $("#sections-scrollable").selectpicker("val", "");

    });

    $("#instructors-bc").click(function () {
        $(this).hide();
        clear("instructor");
        $("#instructors-scrollable").selectpicker("val", "");
    });

    $("#titles-bc").click(function () {
        $(this).hide();
        clear("title");
        $("#titles-scrollable").selectpicker("val", "");
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
            var toPush = '{"IS": {"courses_' + key + '":"' + array[i] + '"}}';
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
                    if (filtersUsed.dept || filtersUsed.id || filtersUsed.instructor || filtersUsed.title || filtersUsed.size) {
                        generateTable(data["result"], "#render", "table table-hover table-condensed");
                        if (grouped) {
                            $("#selectAll").show();
                        } else {
                            $("#selectAll").hide();
                        }
                    } else {
                        $("#selectAll").hide();
                        $("#render")
                            .empty()
                            .append('<div class="alert alert-info" role="alert">Too many items to display. Please narrow your results on the left.</div>');
                    }
                    if (!filtersUsed.dept){
                        var deptScrollable = $("#departments-scrollable");
                        var prevDeptVal = deptScrollable.val();
                        populateDepartments(data["result"]);
                        deptScrollable.selectpicker("val", prevDeptVal);
                    }
                    if (!filtersUsed.id) {
                        var idScrollable = $("#sections-scrollable");
                        var prevIdVal = idScrollable.val();
                        populateSections(data["result"]);
                        idScrollable.selectpicker("val", prevIdVal);
                    }
                    if (!filtersUsed.title) {
                        var titleScrollable = $("#titles-scrollable");
                        var prevTitleVal = titleScrollable.val();
                        populateTitles(data["result"]);
                        titleScrollable.selectpicker("val", prevTitleVal);
                    }
                    if (!filtersUsed.size) {
                        if (!grouped) {
                            populateSize(data["result"]);
                        } else {
                            populateSizeGrouped(data["result"]);
                        }
                    }
                    if (!filtersUsed.instructor && !grouped) {
                        var instructorScrollable = $("#instructors-scrollable");
                        var prevInstructorVal = instructorScrollable.val();
                        populateInstructors(data["result"]);
                        instructorScrollable.selectpicker("val", prevInstructorVal);
                    }
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    }

    function populateDepartments(data) {
        var departmentsScrollable = $("#departments-scrollable");
        populateHelper(data, "courses_dept", departmentsScrollable);
    }

    function populateSections(data) {
        var sectionsScrollable = $("#sections-scrollable");
        populateHelper(data, "courses_id", sectionsScrollable);
    }

    function populateInstructors(data) {
        var instructorsScrollable = $("#instructors-scrollable");
        instructorsScrollable.empty();
        var instructorArray = [];
        for (var i = 0; i < data.length; i++) {
            var instructorSubArray = data[i]["courses_instructor"];
            for (var j = 0; j < instructorSubArray.length; j++) {
                var instructor = instructorSubArray[j];
                if (!instructorArray.includes(instructor) && instructor != "" && instructor != "tba") {
                    instructorArray.push(instructor);
                    instructorsScrollable.append('<option>' + instructor + '</option>');

                }
            }
        }
        // instructorArray.sort();
        // for (var k = 0; k < instructorArray.length; k++) {
        //     instructorsScrollable.append('<option>' + instructorArray[k] + '</option>');
        // }
        instructorsScrollable.selectpicker('refresh');
    }

    function populateTitles(data) {
        var titlesScrollable = $("#titles-scrollable");
        populateHelper(data, "courses_title", titlesScrollable);
    }

    function populateSize(data) {
        var sizeSlider = $("#size-range");
        var min = data[0]["courses_size"];
        var max = data[0]["courses_size"];
        for (var i = 0; i < data.length; i++) {
            var size = data[i]["courses_size"];
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

    function populateSizeGrouped(data) {
        var sizeSlider = $("#size-range");
        var min = data[0]["courseSize"];
        var max = data[0]["courseSize"];
        for (var i = 0; i < data.length; i++) {
            var size = data[i]["courseSize"];
            if (size < min) {
                min = size;
            }
            if (size > max) {
                max = size;
            }
        }
        sizeSlider.slider({
            "min": min,
            "max": max,
            "value": [min, max]
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
            var obj = {dept: $(this).find(".courses_dept").html(), id: $(this).find(".courses_id").html(), size: +($(this).find(".courseSize").html())};
            var exists = false;
            for (var i=0; i < courseSelected.length; i++) {
                if (JSON.stringify(courseSelected[i]) === JSON.stringify(obj)) {
                    exists = true;
                }
            }
            if (!exists) {
                courseSelected.push(obj);
            }
            generateTable(courseSelected, "#courseInput", "table");
            $("#courseInput").find("table").css("margin-bottom", "0px");
            $("#selectClear").show();
            $("#selectSchedulize").show();
            $(".okay").hide();
        });
        $("#scrollableTable").show();
    });

    $("#selectClear").click(function () {
        courseSelected = [];
        $("#selectClear").hide();
        $("#selectSchedulize").hide();
        $(".okay").hide();
        $("#scrollableTable").hide();
    });

    $("#selectSchedulize").click(function () {
        try {
            $.ajax("/input", {type:"POST", data: JSON.stringify({id: "course", data: courseSelected}), contentType: "application/json", dataType: "json", success: function(data) {
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


