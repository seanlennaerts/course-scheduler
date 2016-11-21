$(function () {
    var getAllQueryDebug = {"GET":["courses_dept","courses_id","courses_title","courses_avg","courses_instructor","courses_size", "courses_pass", "courses_fail"],"WHERE":{"GT": {"courses_avg": 90}},"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"};
    var buildQuery = {"GET":["courses_dept","courses_id","courses_title","courses_avg","courses_instructor","courses_size","courses_pass","courses_fail"],
                        "WHERE":{},
                        "ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},
                        "AS":"TABLE"
                    };
    var prevQueryNoGroup = {};

    $(document).ready(function() {
        // "IS": {"courses_dept": "cpsc"} for debugging
        $("#size-range").slider({});
        query(JSON.stringify(buildQuery));
        updateDebugQuery();
    });

    $("#groupAll").click(function () {
        if($(this).is(":checked")) {
            var currentWhere = JSON.stringify(buildQuery.WHERE);
            var groupAllQuery = '{"GET":["courses_dept","courses_id","courses_title","courseAverage","courseSize","coursePass","courseFail"],"WHERE":' + currentWhere +',"GROUP":["courses_dept","courses_id","courses_title"],"APPLY":[{"courseAverage":{"AVG":"courses_avg"}},{"courseSize":{"MAX":"courses_size"}},{"coursePass":{"MAX":"courses_pass"}},{"courseFail":{"MAX":"courses_fail"}}],"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"}';
            groupAllQuery = JSON.parse(groupAllQuery);
            prevQueryNoGroup = buildQuery;
            buildQuery = groupAllQuery;
            $("#instructors-scrollable")
                .prop("disabled", true)
                .selectpicker('refresh');
            query(JSON.stringify(buildQuery), "instructor");
            updateDebugQuery();
        } else {
            buildQuery = prevQueryNoGroup;
            prevQueryNoGroup = {};
            $("#instructors-scrollable")
                .prop("disabled", false)
                .selectpicker('refresh');
            query(JSON.stringify(buildQuery), "instructor");
        }
    });

    $(document).on("click", "#render > table > thead > tr > th", function() {
        //$(this).html() //captures value of header clicked
    });

    $(document).on("change", "#departments-scrollable", function() {
        var departmentsClear = $("#departments-bc");
        departmentsClear.show();
        var dept = $(this).val();
        if (dept) {
            handleDropDowns("dept", dept);
            query(JSON.stringify(buildQuery), "dept");
        } else {
            departmentsClear.hide();
            buildQuery.WHERE = {};
            query(JSON.stringify(buildQuery));
        }
        updateDebugQuery();
    });

    $(document).on("change", "#sections-scrollable", function() {
        var sectionsClear = $("#sections-bc");
        sectionsClear.show();
        var id = $(this).val();
        if (id) {
            handleDropDowns("id", id);
            query(JSON.stringify(buildQuery), "id");
        } else {
            sectionsClear.hide();
            buildQuery.WHERE = {};
            query(JSON.stringify(buildQuery));
        }
        updateDebugQuery();
    });

    $(document).on("change", "#instructors-scrollable", function() {
        var instructorsClear = $("#instructors-bc");
        instructorsClear.show();
        var instructor = $(this).val();
        if (instructor) {
            handleDropDowns("instructor", instructor);
            query(JSON.stringify(buildQuery), "instructor");
        } else {
            instructorsClear.hide();
            buildQuery.WHERE = {};
            query(JSON.stringify(buildQuery));
        }
        updateDebugQuery();
    });

    $(document).on("change", "#titles-scrollable", function() {
        var titlesClear = $("#titles-bc");
        titlesClear.show();
        var title = $(this).val();
        if (title) {
            handleDropDowns("title", title);
            query(JSON.stringify(buildQuery), "title");
        } else {
            titlesClear.hide();
            buildQuery.WHERE = {};
            query(JSON.stringify(buildQuery));
        }
        updateDebugQuery();
    });

    function getORArray(key) {
        var index = -1;
        var andArray = buildQuery.WHERE.AND;
        for (var i=0; i < andArray.length; i++) {
            var sampleORArray = andArray[i].OR[0].IS; //all ors in an AND have the same key so only need to check one
            if (Object.keys(sampleORArray)[0].split("_")[1] === key) {
                index = i;
            }
        }
        return index;
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

    $("#datasetAdd").click(function () {
        var id = $("#datasetId").val();
        var zip = $("#datasetZip").prop('files')[0];
        var data = new FormData();
        data.append("zip", zip);
        $.ajax("/dataset/" + id,
            {
                type: "PUT",
                data: data,
                processData: false
            }).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $("#datasetRm").click(function () {
        var id = $("#datasetId").val();
        $.ajax("/dataset/" + id, {type: "DELETE"}).fail(function (e) {
            spawnHttpErrorModal(e)
        });
    });

    $("#queryForm").submit(function (e) {
        e.preventDefault();
        var query = $("#query").val();
        try {
            $.ajax("/query", {type:"POST", data: query, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    function updateDebugQuery() {
        $("#debug-where")
            .empty()
            .append('<p>' + JSON.stringify(buildQuery["WHERE"]) + '</p>');
        $("#debug-order")
            .empty()
            .append('<p>' + JSON.stringify(buildQuery["ORDER"]) + '</p>');
    }

    function query(queryJson, skip) {
        try {
            $.ajax("/query", {type:"POST", data: queryJson, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    if (skip) {
                        generateTable(data["result"]);
                    }
                    if (skip != "dept"){
                        var deptScrollable = $("#departments-scrollable");
                        var prevDeptVal = deptScrollable.val();
                        populateDepartments(data["result"]);
                        deptScrollable.selectpicker("val", prevDeptVal);
                    }
                    if (skip != "id") {
                        var idScrollable = $("#sections-scrollable");
                        var prevIdVal = idScrollable.val();
                        populateSections(data["result"]);
                        idScrollable.selectpicker("val", prevIdVal);
                    }
                    if (skip != "instructor") {
                        var instructorScrollable = $("#instructors-scrollable");
                        var prevInstructorVal = instructorScrollable.val();
                        populateInstructors(data["result"]);
                        instructorScrollable.selectpicker("val", prevInstructorVal);
                    }
                    if (skip != "title") {
                        var titleScrollable = $("#titles-scrollable");
                        var prevTitleVal = titleScrollable.val();
                        populateTitles(data["result"]);
                        titleScrollable.selectpicker("val", prevTitleVal);
                    }
                    if (skip != "size") {
                        populateSize(data["result"]);
                    }
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    }

    // function queryFirst(queryJson) {
    //     try {
    //         $.ajax("/query", {
    //             type: "POST",
    //             data: queryJson,
    //             contentType: "application/json",
    //             dataType: "json",
    //             success: function (data) {
    //                 if (data["render"] === "TABLE") {
    //                     // generateTable(data["result"]);
    //                     populateDepartments(data["result"]);
    //                     populateSections(data["result"]);
    //                     populateInstructors(data["result"]);
    //                     populateTitles(data["result"]);
    //                     populateSize(data["result"]);
    //                 }
    //             }
    //         }).fail(function (e) {
    //             spawnHttpErrorModal(e)
    //         });
    //     } catch (err) {
    //         spawnErrorModal("Query Error", err);
    //     }
    // }

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
            if (!tempArray.includes(temp) && temp != "") {
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

    function generateTable(data) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title, //.split("_")[1]
                cl: "title",
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select("#render");
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").attr("class", "table table-hover");

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                return d["cl"]
            })
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


