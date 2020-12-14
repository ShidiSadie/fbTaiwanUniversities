import numpy as np
import matplotlib.pyplot as plt
import graph_tool.all as gt
from sklearn import preprocessing
import json

from cnrl import CNRL
from deepgl import DeepGL
from cpca import CPCA

def cnrlGenerator(pair_no, tg, bg, tg_mapping, bg_mapping, tg_in_out, bg_in_out):

    nr = {}
    nr['pair_no'] = pair_no

    # Prepare network representation learning method
    nrl = DeepGL(base_feat_defs=[
        'total_degree', 'betweenness', 'closeness', 'eigenvector', 'pagerank', 'katz', 'out_ratio'
    ],
             rel_feat_ops=['mean', 'sum', 'maximum', 'lp_norm'],
             nbr_types=['all'],
             ego_dist=3,
             lambda_value=0.7)

    # Prepare contrastive learning method
    cl = CPCA()

    # Set network representation and contrastive learning methods
    # using DeepGL and cPCA is i-cNRL (interpretable cNRL)
    cnrl = CNRL(nrl, cl)

    # Learning
    cnrl.fit(tg, bg)

    # Obtain results for plotting
    tg_feat_mat = preprocessing.scale(cnrl.tg_feat_mat)
    bg_feat_mat = preprocessing.scale(cnrl.bg_feat_mat)
    tg_emb = cnrl.transform(feat_mat=tg_feat_mat)
    bg_emb = cnrl.transform(feat_mat=bg_feat_mat)

    feat_defs = cnrl.feat_defs
    fc_cpca = cnrl.loadings
    fc_cpca_max = abs(fc_cpca).max()
    fc_cpca_copy = fc_cpca.tolist()
    max_index = fc_cpca_copy.index(max(fc_cpca_copy, key=lambda x: x[0]))
    nr['feature'] = feat_defs[max_index]
    if fc_cpca_max == 0:
        fc_cpca_max = 1
    fc_cpca /= fc_cpca_max

    coords = []
    for i in range(len(tg_emb)):
        coord = {}
        coord['id'] = int(tg_mapping[i])
        coord['x'] = float(tg_emb[i][0])
        coord['y'] = float(tg_emb[i][1])
        coord['feature_value'] = float(tg_feat_mat[i][max_index])
        coord['out_in_ratio'] = tg_in_out[i]
        coord['type'] = 'target'
        coords.append(coord)

    for i in range(len(bg_emb)):
        coord = {}
        coord['id'] = int(bg_mapping[i])
        coord['x'] = float(bg_emb[i][0])
        coord['y'] = float(bg_emb[i][1])
        coord['feature_value'] = float(bg_feat_mat[i][max_index])
        coord['out_in_ratio'] = bg_in_out[i]
        coord['type'] = 'background'
        coords.append(coord)
    nr['coords'] = coords
    return nr
