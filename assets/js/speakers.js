(function ($) {
    var YOUTUBE_URL =
        "https://www.youtube.com/channel/UCyS8UU1a6K0NM_lSN7ykAnA/playlists";

    function todayStr() {
        return new Date().toISOString().slice(0, 10);
    }

    function isUpcoming(s) {
        return s.date >= todayStr();
    }

    function isPast(s) {
        return s.date < todayStr();
    }

    function getYear(s) {
        return parseInt(s.date.slice(0, 4));
    }

    function formatDate(isoDate) {
        var parts = isoDate.split("-");
        var d = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
        );
        return d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    }

    function buildSpeakerCard(sp) {
        var nameHtml = sp.url
            ? '<a href="' + sp.url + '">' + sp.name + "</a>"
            : sp.name;
        return (
            '<div class="image fit captioned">' +
            "<h3>" +
            nameHtml +
            "<br />" +
            sp.institution +
            "</h3>" +
            "<p>" +
            sp.title +
            "</p>" +
            "<p>" +
            sp.abstract +
            "</p>" +
            "</div>"
        );
    }

    function buildSessionSpeakers(session) {
        if (session.speakers.length === 1) {
            return buildSpeakerCard(session.speakers[0]);
        }
        return (
            '<div class="row 300%">' +
            '<div class="6u 12u$(xsmall)">' +
            buildSpeakerCard(session.speakers[0]) +
            "</div>" +
            '<div class="6u$ 12u$(xsmall)">' +
            buildSpeakerCard(session.speakers[1]) +
            "</div>" +
            "</div>"
        );
    }

    function buildUpcomingBlock(session) {
        var html =
            "<h3>" +
            formatDate(session.date) +
            "</h3>" +
            "<p>Tuesday at 9 AM US Pacific</p>";
        if (session.sessionNote) {
            html += "<p>" + session.sessionNote + "</p>";
        }
        html +=
            '<div class="container">' +
            buildSessionSpeakers(session) +
            "</div>";
        return html;
    }

    function buildPastSessionDetails(session) {
        var html =
            "<details>" +
            '<summary><font size="+1">' +
            formatDate(session.date) +
            "</font></summary>";
        if (session.sessionNote) {
            html += "<p>" + session.sessionNote + "</p>";
        }
        html +=
            '<div class="container">' +
            buildSessionSpeakers(session) +
            "</div></details>";
        return html;
    }

    function buildYearGroupDetails(year, sessions) {
        var sorted = sessions.slice().sort(function (a, b) {
            return b.date.localeCompare(a.date);
        });
        var html =
            "<details>" +
            '<summary><font size="+1"><b>SEMINAR SERIES ' +
            year +
            "</b></font>" +
            "<p>" +
            '<a href="' +
            YOUTUBE_URL +
            '">Recordings</a>' +
            "</p></summary>";
        sorted.forEach(function (s) {
            html += buildPastSessionDetails(s);
        });
        html += "</details>";
        return html;
    }

    var NO_UPCOMING =
        "<p>Please check back here for updates or join our " +
        '<a href="join.html">listserv</a>.</p>';

    function renderUpcomingOnIndex(sessions) {
        var $target = $("#upcoming-speaker-index");
        if ($target.length === 0) return;
        var upcoming = sessions.filter(isUpcoming).sort(function (a, b) {
            return a.date.localeCompare(b.date);
        });
        $target.html(
            upcoming.length ? buildUpcomingBlock(upcoming[0]) : NO_UPCOMING,
        );
    }

    function renderUpcomingOnSchedule(sessions) {
        var $target = $("#upcoming-speaker-schedule");
        if ($target.length === 0) return;
        var upcoming = sessions.filter(isUpcoming).sort(function (a, b) {
            return a.date.localeCompare(b.date);
        });
        if (!upcoming.length) {
            $target.html(NO_UPCOMING);
            return;
        }
        var html = "";
        upcoming.forEach(function (s) {
            html += buildUpcomingBlock(s);
        });
        $target.html(html);
    }

    function renderPastOnSchedule(sessions) {
        var $target = $("#past-seminars");
        if ($target.length === 0) return;
        var past = sessions.filter(isPast);

        var groups = {};
        past.forEach(function (s) {
            var y = getYear(s);
            if (!groups[y]) groups[y] = [];
            groups[y].push(s);
        });

        var years = Object.keys(groups)
            .map(Number)
            .sort(function (a, b) {
                return b - a;
            });

        var html = "";
        years.forEach(function (y) {
            html += buildYearGroupDetails(y, groups[y]);
        });
        $target.html(html);
    }

    $(function () {
        if (
            !$(
                "#upcoming-speaker-index, #upcoming-speaker-schedule, #past-seminars",
            ).length
        )
            return;

        $.getJSON("data/speakers.json")
            .done(function (sessions) {
                renderUpcomingOnIndex(sessions);
                renderUpcomingOnSchedule(sessions);
                renderPastOnSchedule(sessions);
            })
            .fail(function () {
                console.error(
                    "ML4PSP: Failed to load speaker data from data/speakers.json",
                );
            });
    });
})(jQuery);
