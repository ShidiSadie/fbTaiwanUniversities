import numpy as np
from graph_tool.all import *
import pandas as pd
import math
import json
import cnrlSample

G = Graph(directed=False)

#load network
G = load_graph("new_new_network.xml.gz")

#remove self edges
G2 = Graph(G)
for e in G.edges():
    if e.source() == e.target():
        e2 = G2.edge(e.source(), e.target())
        G2.remove_edge(e2)

deg2 = G2.degree_property_map("total")

#in_out_ratio
in_interactions = G2.new_vertex_property("float")
out_interactions = G2.new_vertex_property("float")
out_ratio = G2.new_vertex_property("float")
for v in G2.vertices():
    in_interactions[v] = 0.0
    out_interactions[v] = 0.0
    out_ratio[v] = 0.0
for e in G2.edges():
    if G2.vp.department[e.source()] == G2.vp.department[e.target()]:
        in_interactions[e.source()] += 5*G2.ep.companion[e]+3*G2.ep.message[e]+2*G2.ep.like[e]+G2.ep.friend[e]
        in_interactions[e.target()] += 5*G2.ep.companion[e]+3*G2.ep.message[e]+2*G2.ep.like[e]+G2.ep.friend[e]
    else:
        out_interactions[e.source()] += 5*G2.ep.companion[e]+3*G2.ep.message[e]+2*G2.ep.like[e]+G2.ep.friend[e]
        out_interactions[e.target()] += 5*G2.ep.companion[e]+3*G2.ep.message[e]+2*G2.ep.like[e]+G2.ep.friend[e]
for v in G2.vertices():
    if in_interactions[v]+out_interactions[v] != 0.0:
        out_ratio[v] = out_interactions[v]/(in_interactions[v]+out_interactions[v])
G2.vertex_properties["out_ratio"] = out_ratio

def isolateDep(dep_no, G):
    tmp_G = Graph(G)
    map_list = []
    ratio_list = []
    for v in tmp_G.vertices():
        if tmp_G.vp.department[v] == dep_no+1 and deg2[v] != 0:
            map_list.append(tmp_G.vertex_index[v])
            ratio_list.append(out_ratio[v])
    del_list = []
    for v in tmp_G.vertices():
        if tmp_G.vp.department[v]!=dep_no+1 or deg2[v] == 0 :
            del_list.append(v)
    for v in reversed(sorted(del_list)):
        tmp_G.remove_vertex(v)
    return tmp_G, map_list, ratio_list

if __name__ == '__main__':
    pair_mapping = []
    cnrl_results = []
    scaled_dep_list = np.load('scaled_dep_list.npy')
    cur_pair_num = 0
    #len(scaled_dep_list)-1
    for i in range(len(scaled_dep_list)-1):
        for j in range(i+1, len(scaled_dep_list)):
            cur_pair = {}
            cur_pair['pair_no'] = cur_pair_num
            cur_pair['target_dep'] = i+1
            cur_pair['bg_dep'] = j+1
            pair_mapping.append(cur_pair)
            tg, tg_mapping, tg_in_out = isolateDep(scaled_dep_list[i], G2)
            bg, bg_mapping, bg_in_out = isolateDep(scaled_dep_list[j], G2)
            cnrl_result = cnrlSample.cnrlGenerator(cur_pair_num, tg, bg, tg_mapping, bg_mapping, tg_in_out, bg_in_out)
            cnrl_results.append(cnrl_result)

            cur_pair_num += 1
            cur_pair = {}
            cur_pair['pair_no'] = cur_pair_num
            cur_pair['target_dep'] = j+1
            cur_pair['bg_dep'] = i+1
            pair_mapping.append(cur_pair)
            tg, tg_mapping, tg_in_out = isolateDep(scaled_dep_list[j], G2)
            bg, bg_mapping, bg_in_out = isolateDep(scaled_dep_list[i], G2)
            cnrl_result = cnrlSample.cnrlGenerator(cur_pair_num, tg, bg, tg_mapping, bg_mapping, tg_in_out, bg_in_out)
            cnrl_results.append(cnrl_result)
            cur_pair_num += 1

    fo = open("network_representations.json", "w")
    json.dump(cnrl_results, fo)
    fo.close()

    fo = open("pairs_mapping.json", "w")
    json.dump(pair_mapping, fo)
    fo.close()
