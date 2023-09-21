import Roact from "@rbxts/roact";
import { CoreParameterProps } from ".";
import { clientStore } from "client/rodux/store";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";

interface NumberParameterProps extends CoreParameterProps<number> {
	newValueConstraint?: (newValue: number) => number;
}

export class NumberParameter extends Roact.Component<NumberParameterProps> {
	render() {
		const { order, currentValue, playerFacingName, newValueConstraint, onNewValue } = this.props;

		const onFocusLost = (box: TextBox) => {
			let newValue = tonumber(box.Text);

			if (newValue === undefined) {
				box.Text = tostring(currentValue);
				return;
			}

			if (newValueConstraint) {
				newValue = newValueConstraint(newValue);
			}

			if (currentValue === newValue) {
				box.Text = tostring(currentValue);
				return;
			}

			onNewValue(newValue);
		};

		return (
			<frame
				Key={playerFacingName}
				LayoutOrder={order}
				BackgroundColor3={Color3.fromRGB(68, 68, 68)}
				BorderSizePixel={0}
				Size={new UDim2(0.2, 0, 0.05, 0)}
			>
				<uicorner />
				<uipadding
					PaddingBottom={new UDim(0.1, 0)}
					PaddingLeft={new UDim(0.05, 0)}
					PaddingRight={new UDim(0.025, 0)}
					PaddingTop={new UDim(0.1, 0)}
				/>

				<textlabel
					Key="ParameterName"
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					Size={new UDim2(0.425, 0, 1, 0)}
					Text={playerFacingName}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextSize={14}
					TextWrapped={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<frame
					Key="EditFrame"
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					Position={new UDim2(0.5, 0, 0, 0)}
					Size={new UDim2(0.5, 0, 1, 0)}
				>
					<uicorner />

					<textbox
						Event={{
							FocusLost: onFocusLost,
						}}
						Key="EditBox"
						Active={false}
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Position={new UDim2(0.1, 0, 0.1, 0)}
						Selectable={false}
						Size={new UDim2(0.8, 0, 0.8, 0)}
						Text={tostring(currentValue)}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextWrapped={true}
					>
						<UnifiedTextScaler />
					</textbox>
				</frame>
			</frame>
		);
	}
}
