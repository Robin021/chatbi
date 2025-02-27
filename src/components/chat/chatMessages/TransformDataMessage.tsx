import { TransformDataMessageData } from "@/components/chat/type";
import { PulsingText } from "@/components/ui/PulsingText";
import { Card, Tag, Space, Typography } from "antd";
import { DisplayFetchedDataMessage } from "./DisplayFetchedDataMessage";

const { Text } = Typography;

const TransformDataMessage = ({ transformDataMessageData }: { transformDataMessageData: TransformDataMessageData }) => {
   
    return (
        <Space direction="vertical">
            {transformDataMessageData.query && (
                <Text type="secondary" italic>
                    Query: {transformDataMessageData.query}
                </Text>
            )}
            
            {transformDataMessageData.action && (            
                <Tag color="blue">{transformDataMessageData.action}</Tag>             
            )}

            {transformDataMessageData.transformData && (
                <DisplayFetchedDataMessage 
                    fetchedData={transformDataMessageData.transformData}
                />
            )}

            {transformDataMessageData.finished === false && (
                <PulsingText type="secondary">...</PulsingText>
            )}
        </Space>
    )
}

export default TransformDataMessage;
