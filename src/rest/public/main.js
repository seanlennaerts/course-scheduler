$(function () {
    var getAllQueryDebug = {"GET":["courses_dept","courses_id","courses_title","courses_avg","courses_instructor","courses_size"],"WHERE":{"GT": {"courses_avg": 90}},"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"};
    var getAllQuery = {"GET": ["courses_dept", "courses_id", "courses_title", "courses_avg", "courses_instructor", "courses_size"], "WHERE": {}, "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]}, "AS": "TABLE"};
    var buildQuery = {"GET":["courses_dept","courses_id","courses_title","courses_avg","courses_instructor","courses_size"],
                        "WHERE":{"GT": {"courses_avg": 90}},
                        "ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},
                        "AS":"TABLE"
                    };

    $(document).ready(function() {
        // "IS": {"courses_dept": "cpsc"} for debugging
        $("#size-range").slider({});
        queryFirst(JSON.stringify(getAllQueryDebug));
        updateDebugQuery();
    });

    // $("#groupAll").click(function () {
    //     var groupAllQuery = {"GET":["courses_dept","courses_id","courses_title","courseAverage","courseSize"],"WHERE":{},"GROUP":["courses_dept","courses_id","courses_title"],"APPLY":[{"courseAverage":{"AVG":"courses_avg"}},{"courseSize":{"AVG":"courses_size"}}],"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"};
    //     if($(this).is(":checked")) {
    //         query(JSON.stringify(groupAllQuery))
    //     } else {
    //         query(JSON.stringify(getAllQueryDebug))
    //     }
    // });

    $(document).on("click", "#render > table > thead > tr > th", function() {
        //$(this).html() //captures value of header clicked
    });

    $(document).on("change", "#departments-scrollable", function() {
        // alert($(this).find("option:selected").text());
        var dept = $(this).find("option:selected").text();
        buildQuery.WHERE = {"IS": {"courses_dept": dept}};
        updateDebugQuery();
        // alert("'" + buildQuery + "'")
        query(JSON.stringify(buildQuery));
    });

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

    function query(queryJson) {
        try {
            $.ajax("/query", {type:"POST", data: queryJson, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                    populateSections(data["result"]);
                    populateInstructors(data["result"]);
                    populateTitles(data["result"]);
                    populateSize(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    }

    function queryFirst(queryJson) {
        try {
            $.ajax("/query", {type:"POST", data: queryJson, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                    populateDepartments(data["result"]);
                    populateSections(data["result"]);
                    populateInstructors(data["result"]);
                    populateTitles(data["result"]);
                    populateSize(data["result"]);
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
            if (!tempArray.includes(temp)) {
                tempArray.push(temp);
                selector.append('<option>' + temp + '</option>');
            }
        }
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


