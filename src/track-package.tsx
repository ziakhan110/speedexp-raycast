import { ActionPanel, Form, Action, showToast, Toast, Detail, List, useNavigation } from "@raycast/api";
import fetch from "node-fetch";
import { useState } from "react";
import { format } from 'date-fns';

interface Track {
    mailNo: string;
    actionName: string;
    msgEng: string;
    time: string;
}

interface DataItem {
    mailNo: string;
    tracks: Track[];
}

interface ApiResponse {
    success: boolean;
    error: string | null;
    data: DataItem[];
}

async function handleApiCall(argument: string): Promise<ApiResponse | null> {
    try {
        const response = await fetch('https://speedaf.com/publicservice/v1/api/express/track/listExpressTrack', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br, zstd',
                'lang': 'en_US',
                'version': '1.0.0',
                'countryCode': 'CN',
                'Content-Type': 'application/json;charset=utf-8',
                'Origin': 'https://www.speedaf.com',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Referer': 'https://www.speedaf.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'Priority': 'u=1',
            },
            body: JSON.stringify({ mailNoList: [argument] }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = (await response.json()) as ApiResponse;
        return data;
    } catch (error) {
        showToast(Toast.Style.Failure, "Error", (error as Error).message);
        return null;
    }
}

function TrackDetails({ tracks }: { tracks: Track[] }) {
    return (
        <List>
            {tracks.map((track, index) => (
                <List.Item
                    key={index}
                    title={track.actionName}
                    subtitle={track.msgEng}
                    accessories={[{ text: format(new Date(track.time), "dd MMMM hh:mm a") }]}

                />
            ))}
        </List>
    );
}

function Command() {
    const { push } = useNavigation();
    const [result, setResult] = useState<ApiResponse | null>(null);

    async function handleSubmit(values: { argument: string }): Promise<boolean> {
        const argument = values.argument;
        const result = await handleApiCall(argument);
        if (result) {
            setResult(result);
            showToast(Toast.Style.Success, "Success");
            return true;
        }
        return false;
    }

    if (result && result.data && result.data.length > 0) {
        const dataItem = result.data[0];
        return <TrackDetails tracks={dataItem.tracks} />;
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField id="argument" title="Tracking Number (Speedaf)" placeholder="Tracking Number" />
        </Form>
    );
}

export default Command;
