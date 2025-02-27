import { PulsingText } from "@/components/ui/PulsingText"
import { AnalysisMessageData } from "../type"
import { Card, Space, Typography, Divider } from "antd"

export const AnalysisReportMessage: React.FC<{analysisData: AnalysisMessageData}> = ({analysisData}) => {

     return (
        <>
        <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
                {analysisData.title && (
                    <Typography.Title level={5} style={{margin: 0, padding: 0}}>
                        {analysisData.title}
                    </Typography.Title>
                )}

                {analysisData.title && <Divider />}

                
            </Space>
        </Card>
        {!analysisData.finished && (
            <PulsingText type="secondary">...</PulsingText>
        )}
        </>
    )
}