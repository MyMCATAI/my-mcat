import { SVGProps, FC } from 'react';

import { default as acidBaseIcon } from '@/public/icons/acid-base.svg';
import { default as aerobicIcon } from '@/public/icons/aerobic.svg';
import { default as aminoIcon } from '@/public/icons/amino.svg';
import { default as atomsIcon } from '@/public/icons/atoms.svg';
import { default as attitudeIcon } from '@/public/icons/attitude.svg';
import { default as attributionIcon } from '@/public/icons/attribution.svg';
import { default as benzeneIcon } from '@/public/icons/benzene.svg';
import { default as bioenergeticsIcon } from '@/public/icons/bioenergetics.svg';
import { default as bodyIcon } from '@/public/icons/body.svg';
import { default as bondsIcon } from '@/public/icons/bonds.svg';
import { default as boneIcon } from '@/public/icons/bone.svg';
import { default as brainIcon } from '@/public/icons/brain.svg';
import { default as carIcon } from '@/public/icons/car.svg';
import { default as cellIcon } from '@/public/icons/cell.svg';
import { default as circuitIcon } from '@/public/icons/circuit.svg';
import { default as cognitionIcon } from '@/public/icons/cognition.svg';
import { default as cultureIcon } from '@/public/icons/culture.svg';
import { default as digestionIcon } from '@/public/icons/digestion.svg';
import { default as dna_n_biotechnologyIcon } from '@/public/icons/dna_n_biotechnology.svg';
import { default as electrochemistryIcon } from '@/public/icons/electrochemistry.svg';
import { default as electrostaticsIcon } from '@/public/icons/electrostatics.svg';
import { default as embryoIcon } from '@/public/icons/embryo.svg';
import { default as emotionIcon } from '@/public/icons/emotion.svg';
import { default as endocrineIcon } from '@/public/icons/endocrine.svg';
import { default as energyIcon } from '@/public/icons/energy.svg';
import { default as enzymeIcon } from '@/public/icons/enzyme.svg';
import { default as equiIcon } from '@/public/icons/equi.svg';
import { default as evolutionIcon } from '@/public/icons/evolution.svg';
import { default as expressionIcon } from '@/public/icons/expression.svg';
import { default as eyeScanIcon } from '@/public/icons/eye-scan.svg';
import { default as fatIcon } from '@/public/icons/fat.svg';
import { default as fluidsIcon } from '@/public/icons/fluids.svg';
import { default as forceIcon } from '@/public/icons/force.svg';
import { default as gasesIcon } from '@/public/icons/gases.svg';
import { default as geneticsIcon } from '@/public/icons/genetics.svg';
import { default as glycolysisIcon } from '@/public/icons/glycolysis.svg';
import { default as graphIcon } from '@/public/icons/graph.svg';
import { default as identityformationIcon } from '@/public/icons/identityformation.svg';
import { default as immuneIcon } from '@/public/icons/immune.svg';
import { default as institutionIcon } from '@/public/icons/institution.svg';
import { default as interactionIcon } from '@/public/icons/interaction.svg';
import { default as intermolecularIcon } from '@/public/icons/intermolecular.svg';
import { default as kidneyIcon } from '@/public/icons/kidney.svg';
import { default as kinematicsIcon } from '@/public/icons/kinematics.svg';
import { default as languageIcon } from '@/public/icons/language.svg';
import { default as learningIcon } from '@/public/icons/learning.svg';
import { default as lightIcon } from '@/public/icons/light.svg';
import { default as lipidIcon } from '@/public/icons/lipid.svg';
import { default as lungsIcon } from '@/public/icons/lungs.svg';
import { default as meiosisIcon } from '@/public/icons/meiosis.svg';
import { default as mitosisIcon } from '@/public/icons/mitosis.svg';
import { default as motivationIcon } from '@/public/icons/motivation.svg';
import { default as muscleIcon } from '@/public/icons/muscle.svg';
import { default as opticsIcon } from '@/public/icons/optics.svg';
import { default as perceptionIcon } from '@/public/icons/perception.svg';
import { default as periodicIcon } from '@/public/icons/periodic.svg';
import { default as personalityIcon } from '@/public/icons/personality.svg';
import { default as plasmaIcon } from '@/public/icons/plasma.svg';
import { default as presentationIcon } from '@/public/icons/presentation.svg';
import { default as prokaryotesIcon } from '@/public/icons/prokaryotes.svg';
import { default as proteinsIcon } from '@/public/icons/proteins.svg';
import { default as rnaIcon } from '@/public/icons/rna.svg';
import { default as selfIdentityIcon } from '@/public/icons/self-identity.svg';
import { default as seperationsIcon } from '@/public/icons/seperations.svg';
import { default as shiftIcon } from '@/public/icons/shift.svg';
import { default as skinIcon } from '@/public/icons/skin.svg';
import { default as soconcomIcon } from '@/public/icons/soconcom.svg';
import { default as soconindIcon } from '@/public/icons/soconind.svg';
import { default as solutionsIcon } from '@/public/icons/solutions.svg';
import { default as soundIcon } from '@/public/icons/sound.svg';
import { default as spectroscopyIcon } from '@/public/icons/spectroscopy.svg';
import { default as stereotypeIcon } from '@/public/icons/stereotype.svg';
import { default as stoiIcon } from '@/public/icons/stoi.svg';
import { default as stratificationIcon } from '@/public/icons/stratification.svg';
import { default as structureIcon } from '@/public/icons/structure.svg';
import { default as sugarIcon } from '@/public/icons/sugar.svg';
import { default as thermIcon } from '@/public/icons/therm.svg';
import { default as uterusIcon } from '@/public/icons/uterus.svg';
import { default as virusIcon } from '@/public/icons/virus.svg';

export type IconName = 'acid-base' | 'aerobic' | 'amino' | 'atoms' | 'attitude' | 'attribution' | 'benzene' | 'bioenergetics' | 'body' | 'bonds' | 'bone' | 'brain'| 'car' | 'cell' | 'circuit' | 'cognition' | 'culture' | 'digestion' | 'dna_n_biotechnology' | 'electrochemistry' | 'electrostatics' | 'embryo' | 'emotion' | 'endocrine' | 'energy' | 'enzyme' | 'equi' | 'evolution' | 'expression' | 'eye-scan' | 'fat' | 'fluids' | 'force' | 'gases' | 'genetics' | 'glycolysis' | 'graph' | 'identityformation' | 'immune' | 'institution' | 'interaction' | 'intermolecular' | 'kidney' | 'kinematics' | 'language' | 'learning' | 'light' | 'lipid' | 'lungs' | 'meiosis' | 'mitosis' | 'motivation' | 'muscle' | 'optics' | 'perception' | 'periodic' | 'personality' | 'plasma' | 'presentation' | 'prokaryotes' | 'proteins' | 'rna' | 'self-identity' | 'seperations' | 'shift' | 'skin' | 'soconcom' | 'soconind' | 'solutions' | 'sound' | 'spectroscopy' | 'stereotype' | 'stoi' | 'stratification' | 'structure' | 'sugar' | 'therm' | 'uterus' | 'virus';

export const Icons: Record<IconName, FC<SVGProps<SVGSVGElement>>> = {
  'acid-base': acidBaseIcon,
  'aerobic': aerobicIcon,
  'amino': aminoIcon,
  'atoms': atomsIcon,
  'attitude': attitudeIcon,
  'attribution': attributionIcon,
  'benzene': benzeneIcon,
  'bioenergetics': bioenergeticsIcon,
  'body': bodyIcon,
  'bonds': bondsIcon,
  'bone': boneIcon,
  'brain': brainIcon,
  'car': carIcon,
  'cell': cellIcon,
  'circuit': circuitIcon,
  'cognition': cognitionIcon,
  'culture': cultureIcon,
  'digestion': digestionIcon,
  'dna_n_biotechnology': dna_n_biotechnologyIcon,
  'electrochemistry': electrochemistryIcon,
  'electrostatics': electrostaticsIcon,
  'embryo': embryoIcon,
  'emotion': emotionIcon,
  'endocrine': endocrineIcon,
  'energy': energyIcon,
  'enzyme': enzymeIcon,
  'equi': equiIcon,
  'evolution': evolutionIcon,
  'expression': expressionIcon,
  'eye-scan': eyeScanIcon,
  'fat': fatIcon,
  'fluids': fluidsIcon,
  'force': forceIcon,
  'gases': gasesIcon,
  'genetics': geneticsIcon,
  'glycolysis': glycolysisIcon,
  'graph': graphIcon,
  'identityformation': identityformationIcon,
  'immune': immuneIcon,
  'institution': institutionIcon,
  'interaction': interactionIcon,
  'intermolecular': intermolecularIcon,
  'kidney': kidneyIcon,
  'kinematics': kinematicsIcon,
  'language': languageIcon,
  'learning': learningIcon,
  'light': lightIcon,
  'lipid': lipidIcon,
  'lungs': lungsIcon,
  'meiosis': meiosisIcon,
  'mitosis': mitosisIcon,
  'motivation': motivationIcon,
  'muscle': muscleIcon,
  'optics': opticsIcon,
  'perception': perceptionIcon,
  'periodic': periodicIcon,
  'personality': personalityIcon,
  'plasma': plasmaIcon,
  'presentation': presentationIcon,
  'prokaryotes': prokaryotesIcon,
  'proteins': proteinsIcon,
  'rna': rnaIcon,
  'self-identity': selfIdentityIcon,
  'seperations': seperationsIcon,
  'shift': shiftIcon,
  'skin': skinIcon,
  'soconcom': soconcomIcon,
  'soconind': soconindIcon,
  'solutions': solutionsIcon,
  'sound': soundIcon,
  'spectroscopy': spectroscopyIcon,
  'stereotype': stereotypeIcon,
  'stoi': stoiIcon,
  'stratification': stratificationIcon,
  'structure': structureIcon,
  'sugar': sugarIcon,
  'therm': thermIcon,
  'uterus': uterusIcon,
  'virus': virusIcon,
};