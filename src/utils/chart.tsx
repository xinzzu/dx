export type ServerDataset = {
    data: number[];
    name: string;
};

export type ServerData = {
    datasets: ServerDataset[];
    labels: string[];
};

export function processDataForMultiLine(serverData: ServerData): any[] {
    const { datasets, labels } = serverData;

    const result: any[] = labels.map(label => ({ label }));

    datasets.forEach(dataset => {
        const key = dataset.name;
        dataset.data.forEach((value, index) => {
            result[index][key] = Math.round(value * 100) / 100;
        });
    });

    return result;
}