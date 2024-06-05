import { useEffect, useState } from "react";
const LINE_COUNT = 5;

export default function LogDisplay({ logs }: { logs: string }) {
    const [recentLogs, setRecentLogs] = useState<string[]>([]);

    useEffect(() => {
        const logsArr = logs.split('\n');
        const startIndex = Math.max(0, logsArr.length - LINE_COUNT);
        const recent = logsArr.slice(startIndex);
        setRecentLogs(recent);
    }, [logs]);

    return (
        <ul>
            {recentLogs.map((log, index) => (
                <li key={index}>{log}</li>
            ))}
        </ul>
    )
}