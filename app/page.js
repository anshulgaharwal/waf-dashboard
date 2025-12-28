"use client";
import { useEffect, useState } from "react";

export default function Home() {

  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/anomalies")
      .then(res => res.json())
      .then(result => {
        setData(result.data || []);
        setCount(result.count || 0);
      })
      .catch(() => {
        console.log("API not reachable");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">WAF ML Security Dashboard</h1>
      <p className="text-gray-400 mb-6">
        Total Anomalies Detected: <span className="text-yellow-400 font-bold">{count}</span>
      </p>

      <div className="overflow-x-auto">
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
            </tr>
          </thead>


          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-t border-gray-700 hover:bg-gray-800">
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

                {/* WAF */}
                <td className="p-3 text-green-300 text-sm">
                  <ul className="list-disc ml-4">
                    {item.waf_rules?.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
