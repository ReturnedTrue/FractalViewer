import Roact from "@rbxts/roact";
import { UnifiedTextScaler } from "client/roact/util/components/UnifiedTextScaler";
import { FractalId } from "shared/enums/FractalId";

const fractalDescriptions = new Map<FractalId, string>([
	[FractalId.Mandelbrot, "Uses z = z^2 + c iterative formula"],
	[FractalId.BurningShip, "Uses z = (Re(z^2) + |Im(z^2)|) + c iterative formula"],
	// TODO add more fractal descriptions
]);

interface DescriptionBoxProps {
	fractalViewed: FractalId;
}

export class DescriptionBox extends Roact.Component<DescriptionBoxProps> {
	render() {
		return (
			<frame Key="DescriptionBox" BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				<textlabel
					Key="FractalName"
					Text={`Fractal: ${this.props.fractalViewed}`}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.1, 0)}
					Size={UDim2.fromScale(0.8, 0.1)}
					Font={Enum.Font.Ubuntu}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
				>
					<UnifiedTextScaler />
				</textlabel>

				<textlabel
					Key="FractalDescription"
					Text={fractalDescriptions.get(this.props.fractalViewed) ?? "No description"}
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0, 0.15)}
					Size={UDim2.fromScale(1, 0.85)}
					Font={Enum.Font.Ubuntu}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Top}
					TextColor3={new Color3(1, 1, 1)}
					TextScaled={true}
				>
					<UnifiedTextScaler />
				</textlabel>
			</frame>
		);
	}
}
