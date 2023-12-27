import Roact from "@rbxts/roact";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { CoreParameterProps } from ".";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";

const ENABLED_COLOR = Color3.fromRGB(85, 170, 255);
const DISABLED_COLOR = Color3.fromRGB(52, 52, 52);

interface BooleanParameterProps extends CoreParameterProps<boolean> {}

export class BooleanParameter extends Roact.Component<BooleanParameterProps> {
	render() {
		const onClicked = () => this.props.onNewValue(!this.props.currentValue);

		return (
			<frame
				Key={this.props.playerFacingName}
				LayoutOrder={this.props.order}
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<CornerAndPadding
					paddingOverride={{
						PaddingLeft: new UDim(0.05, 0),
						PaddingRight: new UDim(0.025, 0),
					}}
				/>

				<textbutton
					Key="SelectButton"
					Event={{ MouseButton1Click: onClicked }}
					BackgroundColor3={this.props.currentValue ? ENABLED_COLOR : DISABLED_COLOR}
					BorderSizePixel={0}
					Position={new UDim2(0.5, 0, 0, 0)}
					Size={new UDim2(0.5, 0, 1, 0)}
					TextTransparency={1}
				>
					<uicorner />
					<uipadding
						PaddingBottom={new UDim(0.1, 0)}
						PaddingLeft={new UDim(0.1, 0)}
						PaddingRight={new UDim(0.1, 0)}
						PaddingTop={new UDim(0.1, 0)}
					/>

					<textlabel
						Key="ValueText"
						Text={this.props.currentValue ? "Yes" : "No"}
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Size={new UDim2(1, 0, 1, 0)}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
					>
						<UnifiedTextScaler />
					</textlabel>
				</textbutton>

				<textlabel
					Key="ParameterName"
					Text={this.props.playerFacingName}
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(0.425, 0, 1, 0)}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>
			</frame>
		);
	}
}
