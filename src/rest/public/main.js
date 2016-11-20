$(function () {
    $(document).ready(function() {
        // "IS": {"courses_dept": "cpsc"} for debugging
        var getAllQuery = '{"GET": ["courses_dept", "courses_id", "courses_title", "courses_avg", "courses_instructor", "courses_pass"], "WHERE": {"IS": {"courses_dept": "cpsc"}}, "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]}, "AS": "TABLE"}';
        query(getAllQuery)
    });

    $("#groupAll").click(function () {
        var groupAllQuery = '{"GET":["courses_dept","courses_id","courses_title","courseAverage","coursePass"],"WHERE":{"IS": {"courses_dept": "cpsc"}},"GROUP":["courses_dept","courses_id","courses_title"],"APPLY":[{"courseAverage":{"AVG":"courses_avg"}},{"coursePass":{"AVG":"courses_pass"}}],"ORDER":{"dir":"UP","keys":["courses_dept","courses_id"]},"AS":"TABLE"}';
        var getAllQuery = '{"GET": ["courses_dept", "courses_id", "courses_title", "courses_avg", "courses_instructor", "courses_pass"], "WHERE": {"IS": {"courses_dept": "cpsc"}}, "ORDER": { "dir": "UP", "keys": ["courses_dept", "courses_id"]}, "AS": "TABLE"}';
        if($(this).is(":checked")) {
            query(groupAllQuery)
        } else {
            query(getAllQuery)
        }
    });

    $(document).on("click", "#render > table > thead > tr > th", function(e) {
        $("#debug").append("<p>" + "Clicked on: " + $(this).html() + "</p>")
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

    function query(queryJson) {
        try {
            $.ajax("/query", {type:"POST", data: queryJson, contentType: "application/json", dataType: "json", success: function(data) {
                if (data["render"] === "TABLE") {
                    generateTable(data["result"]);
                }
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
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


