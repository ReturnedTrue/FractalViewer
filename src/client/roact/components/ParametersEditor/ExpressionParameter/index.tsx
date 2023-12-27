import Roact, { createRef } from "@rbxts/roact";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { CoreParameterProps } from "..";
import { CornerAndPadding } from "client/roact/util/components/CornerAndPadding";
import { InputBox } from "./InputBox";

interface ExpressionParameterProps extends CoreParameterProps<string> {
	availableVariables: string[];
	appearOnRight: boolean;
}

interface ExpressionParameterState {
	inputBoxSize?: UDim2;

	isOpen: boolean;
}

export class ExpressionParameter extends Roact.Component<ExpressionParameterProps, ExpressionParameterState> {
	state = identity<ExpressionParameterState>({
		isOpen: false,
	});

	private toggleButtonRef = createRef<TextButton>();

	render() {
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

				<textbutton
					Key="ToggleButton"
					Ref={this.toggleButtonRef}
					Event={{
						MouseButton1Click: () => this.setState({ isOpen: !this.state.isOpen }),
					}}
					BackgroundColor3={Color3.fromRGB(52, 52, 52)}
					BorderSizePixel={0}
					Text=""
					Position={new UDim2(0.5, 0, 0, 0)}
					Size={new UDim2(0.5, 0, 1, 0)}
				>
					<CornerAndPadding />

					<textlabel
						Key="ButtonText"
						BackgroundTransparency={1}
						Font={Enum.Font.Ubuntu}
						Size={new UDim2(1, 0, 1, 0)}
						Text={"Edit"}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextScaled={true}
						TextSize={14}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Center}
					>
						<UnifiedTextScaler />
					</textlabel>
				</textbutton>

				{this.state.isOpen && this.state.inputBoxSize !== undefined && (
					<InputBox
						inputBoxSize={this.state.inputBoxSize}
						currentValue={this.props.currentValue}
						onNewValue={this.props.onNewValue}
						availableVariables={this.props.availableVariables}
						appearOnRight={this.props.appearOnRight}
					/>
				)}
			</frame>
		);
	}

	protected didMount(): void {
		// Utilises the size of the toggle button to size the input box
		const toggleButton = this.toggleButtonRef.getValue()!;

		const setSize = () => {
			const absSize = toggleButton.AbsoluteSize;

			this.setState({ inputBoxSize: UDim2.fromOffset(absSize.X * 2, absSize.Y) });
		};

		setSize();
		toggleButton.GetPropertyChangedSignal("AbsoluteSize").Connect(setSize);
	}
}
