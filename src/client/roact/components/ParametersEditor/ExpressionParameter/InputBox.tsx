import { Dependency } from "@flamework/core";
import Roact, { createRef } from "@rbxts/roact";
import { InterpretController } from "client/controllers/InterpretController";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { FractalParameterValueForType } from "shared/types/FractalParameters";

interface InputBoxProps {
	inputBoxSize: UDim2;

	currentValue: FractalParameterValueForType<string>;
	onNewValue: (value: string) => void;

	availableVariables: string[];
	appearOnRight: boolean;
}

interface InputBoxState {
	highlightedText?: string;
}

export class InputBox extends Roact.Component<InputBoxProps, InputBoxState> {
	private innerBoxRef = createRef<TextBox>();

	render() {
		const onFocusLost = (box: TextBox) => {
			const newValue = box.Text;

			if (newValue === "" || this.props.currentValue === newValue) {
				box.Text = this.props.currentValue;
				return;
			}

			this.updateHighlightedText(newValue);
			this.props.onNewValue(newValue);
		};

		return (
			<frame
				Key="InputBox"
				Position={new UDim2(this.props.appearOnRight ? 1.1 : -1.1, 0, 0, 0)}
				Size={this.props.inputBoxSize}
				BackgroundColor3={Color3.fromRGB(52, 52, 52)}
				BorderSizePixel={0}
			>
				<uicorner />
				<UnifiedTextScaler />

				<textbox
					Key={"InnerBox"}
					Text={this.props.currentValue}
					Event={{
						FocusLost: onFocusLost,
					}}
					Ref={this.innerBoxRef}
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					ClearTextOnFocus={false}
					Font={Enum.Font.Ubuntu}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Center}
					TextColor3={new Color3(1, 1, 1)}
					ZIndex={1}
				>
					<UnifiedTextScaler />
				</textbox>

				<textlabel
					Key={"HighlightedText"}
					Text={this.state.highlightedText ?? "Loading..."}
					Size={UDim2.fromScale(1, 1)}
					BackgroundTransparency={1}
					Font={Enum.Font.Ubuntu}
					TextTruncate={Enum.TextTruncate.None}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextScaled={true}
					TextXAlignment={Enum.TextXAlignment.Center}
					RichText={true}
					ZIndex={2}
				>
					<UnifiedTextScaler />
				</textlabel>
			</frame>
		);
	}

	updateHighlightedText(text?: string) {
		const interpretController = Dependency<InterpretController>();
		const [success, highlighter] = pcall(() => interpretController.getHighlighter(text ?? this.props.currentValue));

		if (!success) {
			this.setState({ highlightedText: `<font color="rgb(255, 0, 0)">${text}</font>` });
			return;
		}

		this.setState({
			highlightedText: highlighter.run(this.props.availableVariables),
		});
	}

	protected didMount() {
		const innerBox = this.innerBoxRef.getValue()!;

		innerBox.GetPropertyChangedSignal("Text").Connect(() => {
			this.updateHighlightedText(innerBox.Text);
		});

		this.updateHighlightedText();
	}
}
