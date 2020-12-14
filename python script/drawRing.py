import numpy as np
from graph_tool.all import *
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
import pandas as pd
import math
import json

def normalizeVertexPropertyValue(prop, G):
    tmp_prop = G.new_vertex_property("double")
    max_value = 0
    min_value = 0
    for v in G.vertices():
        if prop[v]>max_value:
            max_value = prop[v]
    for v in G.vertices():
        tmp_prop[v] = (prop[v]-min_value)/(max_value-min_value)
    return tmp_prop

def normalizeEdgePropertyValue(prop, G):
    tmp_prop = G.new_edge_property("double")
    max_value = 0
    min_value = 0
    for e in G.edges():
        if prop[e]>max_value:
            max_value = prop[e]
    for e in G.edges():
        tmp_prop[e] = (prop[e]-min_value)/(max_value-min_value)
    return tmp_prop

def dToHex(value):
    if value<10:
        return str(value)
    elif value == 10:
        return "A"
    elif value == 11:
        return "B"
    elif value == 12:
        return "C"
    elif value == 13:
        return "D"
    elif value == 14:
        return "E"
    elif value == 15:
        return "F"

def edgeAlphaHex(floatValue, colorHue):
    alphaValue = round(floatValue*255)
    first_hex = dToHex(int(alphaValue/16))
    second_hex = dToHex(alphaValue%16)
    return colorHue+first_hex+second_hex

def edgePropHis(edgePropMap, propLabel):
    edge_prop_amounts = []

    for e in G2.edges():
        edge_prop_amounts.append(edgePropMap[e])

    edge_prop_array = np.asarray(edge_prop_amounts)

    plt.hist(edge_prop_array, bins=50, label=propLabel)
    plt.yscale('log')
    plt.title("The distribution of"+propLabel)
    plt.savefig(propLabel+".png")

def isolateDep(dep_list, dep_no, G):
    tmp_G = Graph(G)
    single_dep_filter = tmp_G.new_vertex_property("bool")
    for v in G.vertices():
        single_dep_filter[v] = 0
    map_list = []
    for v in dep_list[dep_no].keys():
        single_dep_filter[v] = 1
        map_list.append(tmp_G.vertex_index[v])
    np.save('map_list'+str(dep_no)+'.npy', map_list)
    del_list = []
    for v in tmp_G.vertices():
        if tmp_G.vp.department[v]!=dep_no+1:
            del_list.append(v)
    #for v in G.vertices():
        #if not single_dep_filter[v]:
            #tmp_G.remove_vertex(v)
    for v in reversed(sorted(del_list)):
        tmp_G.remove_vertex(v)
    #tmp_G.set_vertex_filter(single_dep_filter)
    for v in tmp_G.vertices():
        print(v)
    tmp_G.save("dep"+str(dep_no)+".xml.gz")
    #for v in tmp_G.vertices():
        #print(v)

G = Graph(directed=False)

#load network
G = load_graph("new_new_network.xml.gz")
#print(G.num_vertices())
#print(G.num_edges())

#self-defined colormap
self_cmap = ListedColormap(["#c15603", "#a77b87", "#db72c8", "#755726", "#bceddb", "#5d8c90", "#ffa52f", "#e48eff", "#ff8ec8", "#fb9ca7", "#d3008c", \
"#ba6efd", "#018700", "#49a150", "#ae083f", "#c84248", "#a0e491", "#d1afef", "#60b385", "#8abf5d", "#05b3aa", "#b6cfaa", "#ebffd4", "#72b8ff", "#8c9ab1", \
"#cae256", "#c86e66", "#366962", "#c144bc", "#cc9790", "#acaa59", "#00ff75", "#9cffff", "#7ea59a", "#9a6900", "#bc9157", "#05acc6", "#da015d", "#ffbad6", \
"#f2cdff", "#ac567c", "#a877ac", "#953f1f", "#79525e", "#d182a3", "#009e7c", "#b8ba01", "#829026", "#54823b", "#93ac83", "#855b89", "#ffaaf6", \
"#6b8567", "#f77589", "#f9ff00", "#916e56", "#916e56", "#ac1a13", "#ff28fd", "#a795c6", "#00fdcf", "#d3c37c", "#b89500", "#00c846", "#ff9070", "#ffcd03",\
"#d6e8ff", "#d442fd", "#bac1df", "#90318e", "#00753f", "#e6a872", "#9ee2ff", "#85e401", "#ff3628"])

#cmp list
self_cmap_list = ["#c15603", "#a77b87", "#db72c8", "#755726", "#bceddb", "#5d8c90", "#ffa52f", "#e48eff", "#ff8ec8", "#fb9ca7", "#d3008c", \
"#ba6efd", "#018700", "#49a150", "#ae083f", "#c84248", "#a0e491", "#d1afef", "#60b385", "#8abf5d", "#05b3aa", "#b6cfaa", "#ebffd4", "#72b8ff", "#8c9ab1", \
"#cae256", "#c86e66", "#366962", "#c144bc", "#cc9790", "#acaa59", "#00ff75", "#9cffff", "#7ea59a", "#9a6900", "#bc9157", "#05acc6", "#da015d", "#ffbad6", \
"#f2cdff", "#ac567c", "#a877ac", "#953f1f", "#79525e", "#d182a3", "#009e7c", "#b8ba01", "#829026", "#54823b", "#93ac83", "#855b89", "#ffaaf6", \
"#6b8567", "#f77589", "#f9ff00", "#916e56", "#916e56", "#ac1a13", "#ff28fd", "#a795c6", "#00fdcf", "#d3c37c", "#b89500", "#00c846", "#ff9070", "#ffcd03",\
"#d6e8ff", "#d442fd", "#bac1df", "#90318e", "#00753f", "#e6a872", "#9ee2ff", "#85e401", "#ff3628"]

self_dscpl_cmap = ["#a6d854", "#e78ac3", "#8da0cb", "#fc8d62", "#66c2a5"]

#remove self edges
G2 = Graph(G)

for e in G.edges():
    if e.source() == e.target():
        e2 = G2.edge(e.source(), e.target())
        G2.remove_edge(e2)

department_cluster_filter = G2.new_edge_property("bool")
for e in G2.edges():
    department_cluster_filter[e] = 0

for e in G2.edges():
    if G2.vp.department[e.source()] == G2.vp.department[e.target()]:
        department_cluster_filter[e] = 1

G2.set_edge_filter(department_cluster_filter)

deg2 = G2.degree_property_map("total")
'''for v in G2.vertices():
    if deg2[v] == 0:
        G2.remove_vertex(v)'''

department_vertex_filter = G2.new_vertex_property("bool")
for v in G2.vertices():
    department_vertex_filter[v] = 1

#print(G2.num_vertices())
#print(G2.num_edges())

G2.clear_filters()

#weight for three interactions
like_weight = 1
message_weight = 3
companion_weight = 6

#define new normalized edge property
weight1 = G2.new_edge_property("double")
weight2 = G2.new_edge_property("double")
weight2_pow = G2.new_edge_property("double")
norm_companion = G2.new_edge_property("double")
norm_message = G2.new_edge_property("double")
norm_like = G2.new_edge_property("double")
norm_weight1 = G2.new_edge_property("double")
norm_weight2 = G2.new_edge_property("double")

norm_companion = normalizeEdgePropertyValue(G2.ep.companion, G2)
norm_message = normalizeEdgePropertyValue(G2.ep.message, G2)
norm_like = normalizeEdgePropertyValue(G2.ep.like, G2)

#edge weight1 (0,1 edge weight)
for e in G2.edges():
    if G2.ep.companion[e]:
        weight1[e] = weight1[e]+companion_weight
    if G2.ep.message[e]:
        weight1[e] = weight1[e]+message_weight
    if G2.ep.like[e]:
        weight1[e] = weight1[e]+like_weight
#normalize weight1
norm_weight1 = normalizeEdgePropertyValue(weight1, G2)
#len
len1 = G2.new_edge_property("double")
tmp = 100
for e in G2.edges():
    if norm_weight1[e]:
        if (norm_weight1[e]<tmp):
            tmp = norm_weight1[e]
        len1[e] = 1/(norm_weight1[e])
    else:
        len1[e] = 11
#print("the lower bound in norm_weight1:", tmp)

#edge weight2
for e in G2.edges():
    weight2[e] = norm_companion[e]*companion_weight + norm_message[e]*message_weight + norm_like[e]*like_weight
    weight2_pow[e] = math.pow(norm_companion[e]*companion_weight + norm_message[e]*message_weight +\
     norm_like[e]*like_weight, 1/3)

#normalize weight1
norm_weight2 = normalizeEdgePropertyValue(weight2_pow, G2)
#len
len2 = G2.new_edge_property("double")
tmp = 100
for e in G2.edges():
    if norm_weight1[e]:
        if (norm_weight2[e]<tmp):
            tmp = norm_weight2[e]
        len2[e] = 1/(norm_weight2[e])
    else:
        len2[e] = 25
#print("the lower bound in norm_weight2:", tmp)

#edge width
e_width1 = G2.new_edge_property("double")
e_width2 = G2.new_edge_property("double")
for e in G2.edges():
    e_width1[e] = math.sqrt(norm_weight1[e])*0.1+0.1
    e_width2[e] = math.sqrt(norm_weight2[e])*0.5+0.1

#edge color
e_color1 = G2.new_edge_property("string")
e_color2 = G2.new_edge_property("string")
for e in G2.edges():
    if G2.ep.companion[e]:
        e_color1[e] = edgeAlphaHex(norm_weight1[e], '#99004D')
        e_color2[e] = edgeAlphaHex(norm_weight2[e], '#99004D')
    else:
        if G2.ep.message[e]:
            e_color1[e] = edgeAlphaHex(norm_weight1[e], '#4d9900')
            e_color2[e] = edgeAlphaHex(norm_weight2[e], '#4d9900')
        else:
            e_color1[e] = edgeAlphaHex(norm_weight1[e], '#004d99')
            e_color2[e] = edgeAlphaHex(norm_weight2[e], '#004d99')

#define edge drawing order
e_order1 = e_width1.copy()
e_order2 = e_width2.copy()

#calculate node size
deg = G2.degree_property_map("total")
shrink_deg = G2.new_vertex_property("double")
for v in G2.vertices():
   shrink_deg[v] = (math.sqrt(deg[v])*0.5 + 0.4)*4

#graph-viz draw
G2.set_edge_filter(department_cluster_filter)

pos_ini = graphviz_draw(G2, layout="neato", overlap="prism", vsize=shrink_deg, vorder=shrink_deg,\
 vcolor=G2.vp.department, vcmap=self_cmap, eorder=e_order2, ecolor=e_color2,\
eprops={'penwidth':e_width2}, vprops={'penwidth':0.2}, output="graphviz-draw-weight1.pdf")

#repin
department_list = []
for i in range(71):
    department_list.append({})

#center of the ring
center_x = 0
center_y = 0
for v in G2.vertices():
    department_list[G2.vp.department[v]-1][v] = pos_ini[v]
    center_x = center_x + pos_ini[v][0]
    center_y = center_y + pos_ini[v][1]
center_x = center_x / G2.num_vertices()
center_y = center_y / G2.num_vertices()

isolateDep(department_list, 1, G2)
isolateDep(department_list, 3, G2)

#r of the ring
r = 0
for v in G2.vertices():
    new_r = math.pow(center_x - pos_ini[v][0], 2) + math.pow(center_y - pos_ini[v][1], 2)
    if new_r > r:
        r = new_r
r = 2*math.sqrt(r)

dep_count=0
num_of_people_in_dept = []
scaled_dep_list = []
#calculate center for each department
dep_center_list = []
for i in range(71):
    dep_center_x = 0
    dep_center_y = 0
    num = 0
    for v in department_list[i]:
        if not deg2[v] == 0:
            num = num + 1
            dep_center_x = dep_center_x + department_list[i][v][0]
            dep_center_y = dep_center_y + department_list[i][v][1]
    num_of_people_in_dept.append(num)
    if num>9:
        scaled_dep_list.append(i)
        dep_count=dep_count+1
        dep_center_x = dep_center_x/num
        dep_center_y = dep_center_y/num
    else:
        for v in department_list[i]:
            department_vertex_filter[v] = 0
    dep_center = []
    dep_center.append(dep_center_x)
    dep_center.append(dep_center_y)
    dep_center_list.append(dep_center)

np.save('scaled_dep_list.npy', scaled_dep_list)
dep_diameter_list = []
dep_diameter_count = 0

'''for v in G.vertices():
    if G.vertex_index[v] == 1610:
        print(G.vp.department[v])'''

#the longest distance in department
for i in range(71):
    dep_dia = 0
    if (num_of_people_in_dept[i]>9):
        for v in department_list[i]:
            if math.pow(dep_center_list[i][0]-department_list[i][v][0], 2)+math.pow(dep_center_list[i][1]-department_list[i][v][1], 2)>dep_dia:
                dep_dia = math.pow(dep_center_list[i][0]-department_list[i][v][0], 2)+math.pow(dep_center_list[i][1]-department_list[i][v][1], 2)
        dep_diameter_list.append(math.sqrt(dep_dia))
        dep_diameter_count = dep_diameter_count+math.sqrt(dep_dia)

#department name mapping
dep_name_map = []
for i in range(0, 71):
    dep_name_map.append(" ")
dep_names = pd.read_csv("department_en.csv",sep=",")
for i, j in dep_names.iterrows():
    dep_name_map[j.department-1] = j.departmentname_en

#reset department center
new_dep_center_list = []
pre_angle = 0
total_people = 0
for i in range(71):
    if num_of_people_in_dept[i]>9:
         total_people = total_people+math.sqrt(num_of_people_in_dept[i])
dep_center_pointer = 0
alpha = 2*math.pi/total_people
#print(dep_count)
#print(len(dep_diameter_list))
old_new_mapping = {}
dep_pos = []
dep_label_list = []
for i in range(71):
    if num_of_people_in_dept[i]>9:
        dep_pos_i = {}
        dep_center = {}
        dep_r = math.sqrt(num_of_people_in_dept[i])/2
        new_dep_center_x = center_x+r*math.cos(alpha*(pre_angle+dep_r))
        new_dep_center_y = center_y+r*math.sin(alpha*(pre_angle+dep_r))
        dep_center['x'] = new_dep_center_x
        dep_center['y'] = new_dep_center_y
        dep_pos_i['dep_center'] = dep_center
        dep_pos_i['r'] = dep_r*alpha*r
        dep_pos.append(dep_pos_i)

        dep_name = dep_name_map[i].strip()
        name_elements = dep_name.split()
        current_length = 0
        current_name = ""
        current_end_x = new_dep_center_x+dep_pos_i['r']*math.cos(alpha*(pre_angle+dep_r))
        current_end_y = new_dep_center_y+dep_pos_i['r']*math.sin(alpha*(pre_angle+dep_r))
        for j in range(len(name_elements)):
            current_length = current_length + len(name_elements[j])
            if (current_length > 21):
                dep_label = {}
                start_pos = {}
                end_pos = {}
                dep_label['name'] = current_name.rstrip()
                end_pos['x'] = current_end_x
                end_pos['y'] = current_end_y
                cur_vector_x = len(dep_label['name'])*math.cos(alpha*(pre_angle+dep_r))*15
                cur_vector_y = len(dep_label['name'])*math.sin(alpha*(pre_angle+dep_r))*15
                start_pos['x'] = end_pos['x']+cur_vector_x
                start_pos['y'] = end_pos['y']+cur_vector_y
                dep_label['no'] = i
                dep_label['step'] = j
                dep_label['start_pos'] = start_pos
                dep_label['end_pos'] = end_pos
                dep_label_list.append(dep_label)
                current_name = name_elements[j]+" "
                current_length = len(name_elements[j])
                x = [cur_vector_x, cur_vector_y, 0]
                if i>=15 and i<=53:
                    y = [0, 0, 1]
                else:
                    y = [0, 0, -1]
                next_vector = np.cross(x, y)
                distance = math.sqrt(next_vector[0]*next_vector[0]+next_vector[1]*next_vector[1])
                current_end_x = current_end_x + next_vector[0]/distance*30
                current_end_y = current_end_y + next_vector[1]/distance*30
            else:
                current_name = current_name+name_elements[j]+" "

        if (current_name):
            dep_label = {}
            start_pos = {}
            end_pos = {}
            dep_label['name'] = current_name.rstrip()
            end_pos['x'] = current_end_x
            end_pos['y'] = current_end_y
            cur_vector_x = len(dep_label['name'])*math.cos(alpha*(pre_angle+dep_r))*14.9
            cur_vector_y = len(dep_label['name'])*math.sin(alpha*(pre_angle+dep_r))*14.9
            start_pos['x'] = end_pos['x']+cur_vector_x
            start_pos['y'] = end_pos['y']+cur_vector_y
            dep_label['no'] = i
            dep_label['step'] = j+1
            dep_label['start_pos'] = start_pos
            dep_label['end_pos'] = end_pos
            dep_label_list.append(dep_label)

    #new_dep_center_y = center_y+r*math.sin(alpha*(pre_angle+dep_diameter_list[i]))
        new_dep_center = []
        new_dep_center.append(new_dep_center_x)
        new_dep_center.append(new_dep_center_y)
        new_dep_center_list.append(new_dep_center)
        old_new_mapping[i] = dep_center_pointer
        pre_angle = pre_angle + 2*dep_r
        dep_center_pointer = dep_center_pointer+1

tmp = []

#new position
current_assigned_dep = 0
for i in range(71):
    if num_of_people_in_dept[i]>9:
        for v in department_list[i]:
            if not deg2[v]==0:
                node = {}
                node_pos = {}
                node_spreading_pos = {}
                node['id'] = G2.vertex_index[v]
                node['v'] = v
                node['dep'] = i+1
                node['size'] = shrink_deg[v]
                #node['color'] = self_cmap_list[i]
                node['color'] = self_dscpl_cmap[G2.vp.discipline[v]]
                node_spreading_pos['x'] = department_list[i][v][0]-dep_center_list[i][0]
                node_spreading_pos['y'] = department_list[i][v][1]-dep_center_list[i][1]
                #pos_ini[v][0] = department_list[i][v][0]-dep_center_list[i][0]+new_dep_center_list[current_assigned_dep][0]
                #pos_ini[v][1] = department_list[i][v][1]-dep_center_list[i][1]+new_dep_center_list[current_assigned_dep][1]
                node_pos['x'] = department_list[i][v][0]-dep_center_list[i][0]+new_dep_center_list[current_assigned_dep][0]
                node_pos['y'] = department_list[i][v][1]-dep_center_list[i][1]+new_dep_center_list[current_assigned_dep][1]
                node['pos'] = node_pos
                node['gender'] = G2.vp.gender[v]
                node['spreading_pos'] = node_spreading_pos
                pos_ini[v][0] = department_list[i][v][0]-dep_center_list[i][0]
                pos_ini[v][1] = department_list[i][v][1]-dep_center_list[i][1]
                tmp.append(node)
        current_assigned_dep = current_assigned_dep+1
#print(current_assigned_dep)

max_node = 0
for node in tmp:
    #print(node['size'])
    if (node['size']>max_node):
        max_node = node['size']
max_node = max_node+1

target = 0
student_nodes = []
for j in range(0, len(tmp)):
    current_small = max_node
    for i in range(0, len(tmp)):
        if (tmp[i]['size']<=current_small and tmp[i].__contains__('v')):
            current_small = tmp[i]['size']
            target = i

    del tmp[target]['v']
    student_nodes.append(tmp[target])

G2.clear_filters()
for e in G2.edges():
    if department_cluster_filter[e]:
        department_cluster_filter[e] = 0
    else:
        department_cluster_filter[e] = 1

conn_inside_dep = []
conn_outside_dep = []

#count edge information
like_dep_count = np.zeros((71,71))
message_dep_count = np.zeros((71,71))
companion_dep_count = np.zeros((71,71))
for e in G2.edges():
    if G2.ep.like[e]:
        like_dep_count[G2.vp.department[e.source()]-1, G2.vp.department[e.target()]-1] = like_dep_count[G2.vp.department[e.source()]-1, G2.vp.department[e.target()]-1]+G2.ep.like[e]
        like_dep_count[G2.vp.department[e.target()]-1, G2.vp.department[e.source()]-1] = like_dep_count[G2.vp.department[e.target()]-1, G2.vp.department[e.source()]-1]+G2.ep.like[e]
    if G2.ep.message[e]:
        message_dep_count[G2.vp.department[e.source()]-1, G2.vp.department[e.target()]-1] = message_dep_count[G2.vp.department[e.source()]-1, G2.vp.department[e.target()]-1]+G2.ep.message[e]
        message_dep_count[G2.vp.department[e.target()]-1, G2.vp.department[e.source()]-1] = message_dep_count[G2.vp.department[e.target()]-1, G2.vp.department[e.source()]-1]+G2.ep.message[e]
    if G2.ep.companion[e]:
        companion_dep_count[G2.vp.department[e.source()]-1, G2.vp.department[e.target()]-1] = companion_dep_count[G2.vp.department[e.source()]-1, G2.vp.department[e.target()]-1]+G2.ep.companion[e]
        companion_dep_count[G2.vp.department[e.target()]-1, G2.vp.department[e.source()]-1] = companion_dep_count[G2.vp.department[e.target()]-1, G2.vp.department[e.source()]-1]+G2.ep.companion[e]

    if G2.ep.like[e]>0 or G2.ep.message[e]>0 or G2.ep.companion[e]>0 or G2.ep.friend[e]:

        color = ""

        if (G2.ep.like[e]>0 and G2.ep.message[e]>0 and G2.ep.companion[e]>0):
            color = '#93003a'
        if (G2.ep.like[e]==0 and G2.ep.message[e]>0 and G2.ep.companion[e]>0):
            color = '#ff28fd'
        if (G2.ep.like[e]>0 and G2.ep.message[e]==0 and G2.ep.companion[e]>0):
            color = '#fb4c89'
        if (G2.ep.like[e]>0 and G2.ep.message[e]>0 and G2.ep.companion[e]==0):
            color = '#17A620'
        if (G2.ep.like[e]==0 and G2.ep.message[e]==0 and G2.ep.companion[e]>0):
            color = '#c84248'
        if (G2.ep.like[e]==0 and G2.ep.message[e]>0 and G2.ep.companion[e]==0):
            color = '#0A91C6'
        if (G2.ep.like[e]>0 and G2.ep.message[e]==0 and G2.ep.companion[e]==0):
            color = '#54DEAB'
        if (G2.ep.like[e]==0 and G2.ep.message[e]==0 and G2.ep.companion[e]==0):
            color = '#eeeeee'

        if G2.vp.department[e.source()] == G2.vp.department[e.target()]:
            conn = {}
            start_pos = {}
            end_pos = {}
            conn['source'] = G2.vertex_index[e.source()]
            conn['target'] = G2.vertex_index[e.target()]
            start_pos['x'] = pos_ini[e.source()][0]
            start_pos['y'] = pos_ini[e.source()][1]
            end_pos['x'] = pos_ini[e.target()][0]
            end_pos['y'] = pos_ini[e.target()][1]
            conn['start_pos'] = start_pos
            conn['end_pos'] = end_pos
            conn['like'] = G2.ep.like[e]
            conn['message'] = G2.ep.message[e]
            conn['companion'] = G2.ep.companion[e]
            conn['color'] = color
            conn_inside_dep.append(conn)

for v in G2.vertices():
    dep_counter = 0
    for i in range(71):
        if num_of_people_in_dept[i]>9:
            like_num = 0
            mes_num = 0
            comp_num = 0
            for v2 in department_list[i]:
                if G2.edge(v, v2):
                    e = G2.edge(v, v2)
                    like_num = like_num+G2.ep.like[e]
                    mes_num = mes_num+G2.ep.message[e]
                    comp_num = comp_num+G2.ep.companion[e]
            if (like_num>0 or mes_num>0 or comp_num>0) and G2.vp.department[v]!=i+1 :
                color = ""
                if (like_num>0 and mes_num>0 and comp_num>0):
                    color = '#93003a'
                if (like_num==0 and mes_num>0 and comp_num>0):
                    color = '#ff28fd'
                if (like_num>0 and mes_num==0 and comp_num>0):
                    color = '#fb4c89'
                if (like_num>0 and mes_num>0 and comp_num==0):
                    color = '#17A620'
                if (like_num==0 and mes_num==0 and comp_num>0):
                    color = '#c84248'
                if (like_num==0 and mes_num>0 and comp_num==0):
                    color = '#0A91C6'
                if (like_num>0 and mes_num==0 and comp_num==0):
                    color = '#54DEAB'
                conn = {}
                start_pos = {}
                end_pos = {}
                conn['source'] = G2.vertex_index[v]
                conn['tgt_dep'] = i+1
                start_pos['x'] = pos_ini[v][0]
                start_pos['y'] = pos_ini[v][1]
                end_pos['x'] = new_dep_center_list[dep_counter][0]
                end_pos['y'] = new_dep_center_list[dep_counter][1]
                conn['start_pos'] = start_pos
                conn['end_pos'] = end_pos
                conn['like'] = like_num
                conn['message'] = mes_num
                conn['companion'] = comp_num
                conn['color'] = color
                conn_outside_dep.append(conn)
            dep_counter = dep_counter+1

department_connection_filter = G2.new_edge_property("bool")
for e in G2.edges():
    department_connection_filter[e] = 0
total_conn = 0
export_data = []

#department edges
for i in range(71):
    if num_of_people_in_dept[i]>9:
        for j in range(i+1, 71):

            if ((like_dep_count[i,j]) or (message_dep_count[i,j]) or (companion_dep_count[i,j]))\
              and (num_of_people_in_dept[j]>9):
                for v1 in department_list[i]:
                    find  = 0
                    for v2 in department_list[j]:
                        if G2.edge(v1,v2) and not(department_connection_filter[G2.edge(v1,v2)]):
                            data_frame = {}
                            pos_frame = {}
                            pos_frame1 = {}
                            pos_frame2 = {}
                            data_frame['source'] = i+1
                            data_frame['target'] = j+1
                            data_frame['like_count'] = like_dep_count[i,j]
                            data_frame['message_count'] = message_dep_count[i,j]
                            data_frame['companion_count'] = companion_dep_count[i,j]
                            if (data_frame['like_count']>0 and data_frame['message_count']>0 and\
                                data_frame['companion_count']>0):
                                data_frame['color'] = '#93003a'
                            if (data_frame['like_count']==0 and data_frame['message_count']>0 and\
                                data_frame['companion_count']>0):
                                data_frame['color'] = '#ff28fd'
                            if (data_frame['like_count']>0 and data_frame['message_count']==0 and\
                                data_frame['companion_count']>0):
                                data_frame['color'] = '#fb4c89'
                            if (data_frame['like_count']>0 and data_frame['message_count']>0 and\
                                data_frame['companion_count']==0):
                                data_frame['color'] = '#17A620'
                            if (data_frame['like_count']==0 and data_frame['message_count']==0 and\
                                data_frame['companion_count']>0):
                                data_frame['color'] = '#c84248'
                            if (data_frame['like_count']==0 and data_frame['message_count']>0 and\
                                data_frame['companion_count']==0):
                                data_frame['color'] = '#0A91C6'
                            if (data_frame['like_count']>0 and data_frame['message_count']==0 and\
                                data_frame['companion_count']==0):
                                data_frame['color'] = '#54DEAB'
                            pos_frame['x'] = new_dep_center_list[old_new_mapping[i]][0]
                            pos_frame['y'] = new_dep_center_list[old_new_mapping[i]][1]
                            data_frame['start_point'] = pos_frame
                            pos_frame1['x'] = new_dep_center_list[old_new_mapping[j]][0]
                            pos_frame1['y'] = new_dep_center_list[old_new_mapping[j]][1]
                            data_frame['end_point'] = pos_frame1
                            dep_dist = math.sqrt( ( (pos_frame['x'] - pos_frame1['x'])**2 )\
                                                 +( (pos_frame['y'] - pos_frame1['y'])**2 ) )
                            para_A = dep_dist/(2*r)
                            para_C = 1-dep_dist/(2*r)
                            pos_frame2['x'] = ( ( pos_frame['x'] + pos_frame1['x'] )/2 )*para_C + center_x*para_A
                            pos_frame2['y'] = ( ( pos_frame['y'] + pos_frame1['y'] )/2 )*para_C + center_y*para_A
                            data_frame['mid_point'] = pos_frame2
                            export_data.append(data_frame)
                            department_connection_filter[G2.edge(v1,v2)] = 1
                            find = 1
                            total_conn = total_conn+1
                            break
                    if (find):
                        break

fo = open("department_data.json", "w")
json.dump(export_data, fo)
fo.close()

fo = open("department_pos.json", "w")
json.dump(dep_pos, fo)
fo.close()

fo = open("department_label.json", "w")
json.dump(dep_label_list, fo)
fo.close()

fo = open("Owners.json", "w")
json.dump(student_nodes, fo)
fo.close()

fo = open("conn_outside_dep.json", "w")
json.dump(conn_outside_dep, fo)
fo.close()

fo = open("conn_inside_dep.json", "w")
json.dump(conn_inside_dep, fo)
fo.close()
print(total_conn)

graphviz_position = G2.new_vertex_property("float")
for v in G2.vertices():
    graphviz_position[v] = pos_ini[v][0]

G2.set_edge_filter(department_connection_filter)
G2.set_vertex_filter(department_vertex_filter)

graphviz_draw(G2, pos=pos_ini, pin=True, vsize=shrink_deg, vorder=shrink_deg,\
 vcolor=G2.vp.department, vcmap=self_cmap, eorder=e_order2, ecolor=e_color2,\
eprops={'penwidth':e_width2}, vprops={'penwidth':0.2}, gprops={'splines':'curved'}, output="graphviz-draw-weight3.pdf")

graphviz_draw(G2, pos=pos_ini, pin=True, vsize=shrink_deg, vorder=shrink_deg,\
 vcolor=G2.vp.department, vcmap=self_cmap, eorder=e_order2, ecolor=e_color2,\
eprops={'penwidth':e_width2}, vprops={'penwidth':0.2}, gprops={'splines':'curved'}, output="graphviz-draw-weight3.svg")

'''graphviz_draw(G2, pos=pos_ini, pin=True, vsize=shrink_deg, vorder=shrink_deg,\
 vcolor=G2.vp.department, vcmap=self_cmap, vprops={'penwidth':0.2}, gprops={'spline':'curved'}, output="graphviz-draw-weight3.pdf")'''

#graph_draw(G2, pos=pos_ini, vertex_size=shrink_deg, vorder=shrink_deg, output="graph-draw.pdf")


'''global_pos = []
for v in G2.vertices():
    global_pos.append(pos_ini[v][0])
np.savetxt('global_pos.txt', global_pos, delimiter=',')'''
