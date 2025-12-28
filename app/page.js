"use client";
import { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

export default function Home() {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [policy, setPolicy] = useState({});
  const [applyStatus, setApplyStatus] = useState("");
  const [currentPolicy, setCurrentPolicy] = useState({});


  // ---------- FEEDBACK FUNCTION ----------
  const sendFeedback = (time, label) => {
    fetch("http://127.0.0.1:8000/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, label })
    })
      .then(() => alert("Feedback Recorded"))
      .catch(() => alert("Failed to send feedback"));
  };

  // ---------- AUTO REFRESH ----------
  useEffect(() => {
    const fetchData = () => {
      fetch("http://127.0.0.1:8000/anomalies")
        .then(res => res.json())
        .then(result => {
          setData(result.data || []);
          setCount(result.count || 0);
        });

      fetch("http://127.0.0.1:8000/model-metrics")
        .then(res => res.json())
        .then(result => setMetrics(result));

      fetch("http://127.0.0.1:8000/adaptive-policy")
        .then(res => res.json())
        .then(result => setPolicy(result));

      fetch("http://127.0.0.1:8000/policy_state.json")
        .then(res => res.json())
        .then(result => setCurrentPolicy(result))
        .catch(() => {});
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">WAF ML Security Dashboard</h1>

      <p className="text-gray-400 mb-6">
        Total Anomalies Detected:{" "}
        <span className="text-yellow-400 font-bold">{count}</span>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-gray-400 text-sm">Total Anomalies</h3>
          <p className="text-3xl font-bold">{metrics.total_anomalies || 0}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-gray-400 text-sm">Feedback Received</h3>
          <p className="text-3xl font-bold">{metrics.feedback_count || 0}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-gray-400 text-sm">Model Confidence</h3>
          <p className="text-3xl font-bold text-green-400">
            {metrics.model_confidence || 0}%
          </p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-gray-400 text-sm">Last Feedback</h3>
          <p className="text-lg">
            {metrics.last_feedback_time || "N/A"}
          </p>
        </div>
        <div className="bg-gray-900 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Adaptive Learning Engine</h2>

          <p className="text-gray-300">
            Status: 
            <span className="text-yellow-400 ml-2">
              {policy.status || "N/A"}
            </span>
          </p>

          <p className="text-gray-300">
            Message:
            <span className="text-blue-400 ml-2">
              {policy.message || "N/A"}
            </span>
          </p>

          <p className="text-gray-300">
            Recommended Contamination:
            <span className="text-green-400 ml-2">
              {policy.recommended_contamination || "0"}
            </span>
          </p>
          <button
            onClick={() => {
              fetch("http://127.0.0.1:8000/apply-policy", {
                method: "POST"
              })
                .then(res => res.json())
                .then(result => {
                  if(result.updated){
                    setApplyStatus("✅ Policy Applied: Model Retrained Successfully");
                  } else {
                    setApplyStatus("⚠️ " + result.message);
                  }
                })
                .catch(() => setApplyStatus("❌ Failed to contact backend"));
            }}
            className="bg-purple-600 px-4 py-2 rounded mt-3"
          >
            APPLY AI RECOMMENDATION
          </button>
          <p className="mt-2 text-green-400">
            {applyStatus}
          </p>
        </div>
      </div>


      {/* ================= Charts ================= */}
      <div className="overflow-x-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Attack Trend */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Attack Trend</h2>
            <Line
              data={{
                labels: data.map(x => x.time),
                datasets: [
                  {
                    label: "Requests per Minute",
                    data: data.map(x => x.requests_per_min),
                    borderColor: "rgb(99, 179, 237)",
                    borderWidth: 2
                  }
                ]
              }}
            />
          </div>

          {/* Severity Distribution */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Severity Distribution
            </h2>

            <Pie
              data={{
                labels: ["CRITICAL", "MODERATE", "LOW"],
                datasets: [
                  {
                    data: [
                      data.filter(a => a.severity === "CRITICAL").length,
                      data.filter(a => a.severity === "MODERATE").length,
                      data.filter(a => a.severity === "LOW").length
                    ],
                    backgroundColor: ["#dc2626", "#ca8a04", "#16a34a"]
                  }
                ]
              }}
            />
          </div>
        </div>


        {/* ================= TABLE ================= */}
        <table className="w-full border border-gray-700 rounded-lg">
          <thead className="bg-gray-800">
            <tr>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Req/min</th>
              <th className="p-3 text-left">Payload</th>
              <th className="p-3 text-left">IPs</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Recommended Action</th>
              <th className="p-3 text-left">WAF Rules</th>
              <th className="p-3 text-left">Feedback</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="p-3">{item.time}</td>
                <td className="p-3">{item.requests_per_min}</td>
                <td className="p-3">{item.avg_payload_size}</td>
                <td className="p-3">{item.unique_ips}</td>

                {/* Severity */}
                <td className="p-3">
                  <span
                    className={
                      item.severity === "CRITICAL"
                        ? "bg-red-700 px-3 py-1 rounded text-sm"
                        : item.severity === "MODERATE"
                        ? "bg-yellow-600 px-3 py-1 rounded text-sm"
                        : "bg-green-600 px-3 py-1 rounded text-sm"
                    }
                  >
                    {item.severity}
                  </span>
                </td>

                {/* Reasons */}
                <td className="p-3 text-gray-300">
                  {item.reasons?.join(", ")}
                </td>

                {/* Recommendations */}
                <td className="p-3 text-blue-300">
                  <ul className="list-disc ml-4">
                    {item.recommendations?.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </td>

                {/* WAF Rules */}
                <td className="p-3 text-green-300 text-sm">
                  <ul className="list-disc ml-4">
                    {item.waf_rules?.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </td>

                {/* Feedback Buttons */}
                <td className="p-3">
                  <button
                    onClick={() => sendFeedback(item.time, "TP")}
                    className="bg-green-600 px-2 py-1 mr-2 rounded"
                  >
                    Legit Attack
                  </button>

                  <button
                    onClick={() => sendFeedback(item.time, "FP")}
                    className="bg-yellow-500 px-2 py-1 mr-2 rounded"
                  >
                    False Positive
                  </button>

                  <button
                    onClick={() => sendFeedback(item.time, "Investigate")}
                    className="bg-blue-500 px-2 py-1 rounded"
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
